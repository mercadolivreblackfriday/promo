<?php
declare(strict_types=1);
require_once __DIR__ . '/store.php';

$id = trim((string) ($_GET['id'] ?? ''));
if ($id === '') {
    json_response(['success' => false, 'error' => 'ID da transacao obrigatorio'], 400);
}

$token = env_value('LULAPAY_TOKEN') ?: 'gwk_c25fff532aaa9ca37b2187ea884c991a2b6114d7ca6b3125';

$param = (strpos($id, 'ord_') === 0) ? ('id=' . rawurlencode($id)) : ('external_id=' . rawurlencode($id));

$ch = curl_init('https://lulapay.onrender.com/api/v1/cobranca.php?' . $param);
curl_setopt_array($ch, [
    CURLOPT_HTTPGET => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'Authorization: Bearer ' . $token
    ],
    CURLOPT_TIMEOUT => 15
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode((string) $response, true);
$raw = strtolower((string) ($data['status'] ?? 'pending'));
$mapped = in_array($raw, ['paid', 'approved', 'completed', 'pago'], true) ? 'APPROVED' : ($raw === 'canceled' || $raw === 'refunded' ? 'CANCELED' : 'PENDING');

json_response([
    'success' => true,
    'status' => $mapped,
    'transacao_id' => $id,
    'raw_status' => $raw
]);
