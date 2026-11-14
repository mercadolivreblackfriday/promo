<?php
declare(strict_types=1);
require_once __DIR__ . '/store.php';

$id = trim((string) ($_GET['id'] ?? ''));
if ($id === '') {
    json_response(['success' => false, 'error' => 'ID da transacao obrigatorio'], 400);
}

$apiKey = env_value('PINGUPAG_SECRET_KEY') ?: 'pingupag_sk_185039b4a3f9c649956d48c5cfdeffdc70cb188711ef3a5d1d73c7c4f3a6dacd';

$ch = curl_init('https://app.pingupag.com/gateway/v1/query?action=get_transaction&id=' . rawurlencode($id));
curl_setopt_array($ch, [
    CURLOPT_HTTPGET => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'X-API-Key: ' . $apiKey
    ],
    CURLOPT_TIMEOUT => 15
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode((string) $response, true);
$raw = strtoupper((string) ($data['status'] ?? (isset($data[0]['status']) ? $data[0]['status'] : 'PENDING')));
$mapped = in_array($raw, ['PAID', 'APPROVED', 'COMPLETED', 'SUCCEEDED', 'PAGO'], true) ? 'APPROVED' : 'PENDING';

json_response([
    'success' => true,
    'status' => $mapped,
    'transacao_id' => $id,
    'raw_status' => $raw
]);
