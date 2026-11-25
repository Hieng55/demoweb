<?php

declare(strict_types=1);

const INET_DOMAIN_CHECK_URL = 'https://dms.inet.vn/api/rms/v1/domain/checkavailable';
const INET_SUFFIX_LIST_URL = 'https://dms.inet.vn/api/rms/v1/suffix/list';
const INET_PUBLIC_WHOIS_URL = 'https://dms.inet.vn/api/public/whois/v1/whois/directly';
const PUBLIC_RDAP_URL = 'https://rdap.org/domain/';

function domain_cache_key(string $namespace, string $value): string
{
    return $namespace . ':' . hash('sha256', $value);
}
function normalize_domain(mixed $value): string
{
    $domain = strtolower(clean_text($value, 253));
    $domain = preg_replace('#^https?://#', '', $domain) ?? '';
    $domain = preg_replace('/^www\./', '', $domain) ?? '';
    $domain = preg_split('/[\/?#]/', $domain)[0] ?? '';
    return rtrim($domain, '.');
}

function valid_domain(string $domain): bool
{
    if ($domain === '' || strlen($domain) > 253 || !str_contains($domain, '.')) {
        return false;
    }
    foreach (explode('.', $domain) as $label) {
        if ($label === '' || strlen($label) > 63 || !preg_match('/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/', $label)) {
            return false;
        }
    }
    return true;
}

function normalize_availability(mixed $value): string
{
    if ($value === true || $value === 1) return 'available';
    if ($value === false || $value === 0) return 'taken';
    $status = strtolower(clean_text($value, 60));
    $status = preg_replace('/[\s_-]+/', '', $status) ?? '';
    if (in_array($status, ['available', 'free', 'true', '1', 'yes', 'canregister'], true)) return 'available';
    if (in_array($status, ['unavailable', 'notavailable', 'registered', 'taken', 'exists', 'false', '0', 'no'], true)) return 'taken';
    return 'unknown';
}

function domain_suffix(string $domain): string
{
    $labels = explode('.', $domain);
    array_shift($labels);
    return implode('.', $labels);
}

function check_domains(array $rawDomains): array
{
    $domains = [];
    foreach ($rawDomains as $value) {
        $domain = normalize_domain($value);
        if ($domain !== '' && !in_array($domain, $domains, true)) {
            $domains[] = $domain;
        }
    }
    $domains = array_slice($domains, 0, 5);
    if ($domains === [] || count(array_filter($domains, 'valid_domain')) !== count($domains)) {
        throw new ApiException('invalid_domain');
    }

    $token = (string) app_config()['inet_token'];
    $resultsByDomain = [];
    $missing = [];
    foreach ($domains as $domain) {
        $cached = cache_get(domain_cache_key('result', $domain));
        if ($cached) {
            $resultsByDomain[$domain] = $cached;
        } else {
            $missing[] = $domain;
        }
    }

    if ($missing !== []) {
        $requests = array_map(static fn (string $domain): array => [
            'url' => INET_DOMAIN_CHECK_URL,
            'method' => 'POST',
            'headers' => ['token' => $token],
            'json' => ['name' => $domain],
        ], $missing);
        $responses = http_json_many($requests);

        foreach ($responses as $index => $response) {
            if ($response['status'] < 200 || $response['status'] >= 300 || !is_array($response['data'])) {
                throw new ApiException('provider_unavailable', 502);
            }
            $payload = $response['data'];
            $rawStatus = $payload['available']
                ?? $payload['isAvailable']
                ?? $payload['availability']
                ?? $payload['status']
                ?? null;
            $availability = normalize_availability($rawStatus);
            if ($availability === 'unknown' && clean_text($rawStatus, 60) !== '') {
                $availability = 'taken';
            }
            $domain = $missing[$index];
            $resultsByDomain[$domain] = [
                'domain' => $domain,
                'availability' => $availability,
                'price' => $payload['sellingPrice'] ?? $payload['price'] ?? $payload['registerPrice'] ?? null,
            ];
        }

        enrich_domain_results($resultsByDomain, $missing, $token);
        foreach ($missing as $domain) {
            cache_put(domain_cache_key('result', $domain), $resultsByDomain[$domain], 60);
        }
    }

    return array_map(static fn (string $domain): array => $resultsByDomain[$domain], $domains);
}

function enrich_domain_results(array &$resultsByDomain, array $domains, string $token): void
{
    $detailByKey = [];
    $pending = [];
    foreach ($domains as $domain) {
        $result = $resultsByDomain[$domain];
        $type = $result['availability'] === 'available' ? 'pricing' : ($result['availability'] === 'taken' ? 'whois' : '');
        $value = $type === 'pricing' ? domain_suffix($domain) : $domain;
        if ($type === '' || $value === '') continue;

        $key = $type . ':' . $value;
        if (array_key_exists($key, $detailByKey)) continue;
        $cached = cache_get(domain_cache_key('detail', $key));
        if ($cached) {
            $detailByKey[$key] = $cached;
            continue;
        }

        $pending[$key] = $type === 'pricing'
            ? ['url' => INET_SUFFIX_LIST_URL, 'method' => 'POST', 'headers' => ['token' => $token], 'json' => ['suffix' => $value]]
            : ['url' => INET_PUBLIC_WHOIS_URL, 'method' => 'POST', 'json' => ['domainName' => $value]];
    }

    if ($pending !== []) {
        $keys = array_keys($pending);
        $responses = http_json_many(array_values($pending));
        foreach ($responses as $index => $response) {
            $key = $keys[$index];
            [$type, $value] = explode(':', $key, 2);
            $detail = $type === 'pricing' ? parse_suffix_pricing($response) : parse_inet_whois($response);
            if ($type === 'whois' && $detail === []) {
                $detail = parse_rdap_whois(http_json(['url' => PUBLIC_RDAP_URL . rawurlencode($value)]));
            }
            $detailByKey[$key] = $detail;
            cache_put(domain_cache_key('detail', $key), $detail, 21600);
        }
    }

    foreach ($domains as $domain) {
        $result = $resultsByDomain[$domain];
        if ($result['availability'] === 'available') {
            $pricing = $detailByKey['pricing:' . domain_suffix($domain)] ?? [];
            $resultsByDomain[$domain] = $result + $pricing;
            $resultsByDomain[$domain]['price'] = $result['price'] ?: ($pricing['registrationPrice'] ?? null);
        } elseif ($result['availability'] === 'taken') {
            $resultsByDomain[$domain]['whois'] = $detailByKey['whois:' . $domain] ?? null;
        }
    }
}

function parse_suffix_pricing(array $response): array
{
    if ($response['status'] < 200 || $response['status'] >= 300 || !is_array($response['data'])) return [];
    $payload = $response['data'];
    $rows = $payload;
    foreach (['data', 'items', 'result', 'list'] as $key) {
        if (isset($payload[$key]) && is_array($payload[$key])) {
            $rows = $payload[$key];
            break;
        }
    }
    $row = isset($rows[0]) && is_array($rows[0]) ? $rows[0] : (is_array($rows) ? $rows : []);
    return [
        'registrationPrice' => first_positive($row, ['regPromotion', 'regOrigin', 'registerPrice', 'registrationPrice', 'sellingPrice']),
        'renewalPrice' => first_positive($row, ['renPromotion', 'renOrigin', 'renewPrice', 'renewalPrice']),
        'transferPrice' => first_positive($row, ['transferPromotion', 'transferOrigin', 'transferPrice']),
    ];
}

function first_positive(array $row, array $keys): ?float
{
    foreach ($keys as $key) {
        $value = $row[$key] ?? null;
        if (is_numeric($value) && (float) $value > 0) return (float) $value;
    }
    return null;
}

function parse_inet_whois(array $response): array
{
    if ($response['status'] < 200 || $response['status'] >= 300 || !is_array($response['data'])) return [];
    $payload = $response['data'];
    if ((string) ($payload['code'] ?? '') !== '0' || empty($payload['domainName'])) return [];
    return [
        'createdAt' => inet_whois_date($payload['creationDate'] ?? ''),
        'expiresAt' => inet_whois_date($payload['expirationDate'] ?? ''),
        'registrar' => clean_text($payload['registrar'] ?? '', 200),
        'registrantName' => clean_text($payload['registrantName'] ?? '', 200),
        'statuses' => array_slice(array_values(array_filter(array_map(static fn ($value) => clean_text($value, 100), (array) ($payload['status'] ?? [])))), 0, 8),
        'nameservers' => array_slice(array_values(array_filter(array_map(static fn ($value) => strtolower(clean_text($value, 253)), (array) ($payload['nameServer'] ?? [])))), 0, 8),
        'dnssec' => strtolower(clean_text($payload['DNSSEC'] ?? '', 40)),
        'source' => 'inet-whois',
    ];
}

function inet_whois_date(mixed $value): string
{
    $date = clean_text($value, 30);
    return preg_match('/^(\d{2})-(\d{2})-(\d{4})$/', $date, $matches)
        ? $matches[3] . '-' . $matches[2] . '-' . $matches[1]
        : $date;
}

function parse_rdap_whois(array $response): array
{
    if ($response['status'] < 200 || $response['status'] >= 300 || !is_array($response['data'])) return [];
    $payload = $response['data'];
    $registrar = rdap_entity($payload['entities'] ?? [], 'registrar');
    $registrant = rdap_entity($payload['entities'] ?? [], 'registrant');
    return [
        'createdAt' => rdap_event_date($payload['events'] ?? [], ['registration']),
        'updatedAt' => rdap_event_date($payload['events'] ?? [], ['last changed', 'last update of RDAP database']),
        'expiresAt' => rdap_event_date($payload['events'] ?? [], ['expiration']),
        'registrar' => rdap_vcard_value($registrar, ['fn', 'org']),
        'registrantOrganization' => rdap_vcard_value($registrant, ['org']),
        'statuses' => array_slice((array) ($payload['status'] ?? []), 0, 8),
        'nameservers' => array_slice(array_values(array_filter(array_map(
            static fn ($item) => strtolower(clean_text($item['ldhName'] ?? $item['unicodeName'] ?? '', 253)),
            (array) ($payload['nameservers'] ?? [])
        ))), 0, 8),
        'dnssec' => isset($payload['secureDNS']['delegationSigned'])
            ? ($payload['secureDNS']['delegationSigned'] ? 'signed' : 'unsigned')
            : '',
        'source' => 'rdap',
    ];
}

function rdap_entity(array $entities, string $role): array
{
    foreach ($entities as $entity) {
        if (is_array($entity) && in_array($role, (array) ($entity['roles'] ?? []), true)) return $entity;
    }
    return [];
}

function rdap_event_date(array $events, array $actions): string
{
    $wanted = array_map('strtolower', $actions);
    foreach ($events as $event) {
        if (is_array($event) && in_array(strtolower(clean_text($event['eventAction'] ?? '', 80)), $wanted, true)) {
            return clean_text($event['eventDate'] ?? '', 60);
        }
    }
    return '';
}

function rdap_vcard_value(array $entity, array $fields): string
{
    $rows = $entity['vcardArray'][1] ?? [];
    if (!is_array($rows)) return '';
    foreach ($fields as $field) {
        foreach ($rows as $row) {
            $value = is_array($row) ? ($row[3] ?? '') : '';
            if (($row[0] ?? '') === $field && is_string($value) && !preg_match('/redacted|privacy/i', $value)) {
                return clean_text($value, 200);
            }
        }
    }
    return '';
}
