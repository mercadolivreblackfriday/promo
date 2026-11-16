<?php
declare(strict_types=1);
require_once __DIR__ . '/store.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Metodo nao permitido'], 405);
}

$input = request_json();
$amount = (int) ($_GET['price_cents'] ?? $input['price_cents'] ?? 6990);
if ($amount < 100) {
    json_response(['success' => false, 'error' => 'Valor invalido'], 400);
}

$customer = is_array($input['customer'] ?? null) ? $input['customer'] : [];
$name = trim((string) ($customer['name'] ?? $input['nome_pagador'] ?? 'Cliente Mercado Livre')) ?: 'Cliente Mercado Livre';
$email = filter_var((string) ($customer['email'] ?? $input['email_pagador'] ?? ''), FILTER_VALIDATE_EMAIL) ?: 'contato@cliente.com';
$cpf = preg_replace('/\D+/', '', (string) ($customer['cpf'] ?? $customer['document'] ?? $input['cpf_pagador'] ?? '05481744180'));
if (strlen($cpf) !== 11) {
    $cpf = '05481744180';
}
$phone = preg_replace('/\D+/', '', (string) ($customer['phone'] ?? $input['telefone_pagador'] ?? '11999999999')) ?: '11999999999';
$utm = store_utm_from_input(is_array($input['utm'] ?? null) ? $input['utm'] : ($input['tracking'] ?? []));
$produto = trim((string) ($input['produto'] ?? $input['description'] ?? 'Caixa JBL Boombox 4'));

$refId = 'REF-' . time() . '-' . mt_rand(1000, 9999);
$apiKey = env_value('PINGUPAG_SECRET_KEY') ?: 'pingupag_sk_185039b4a3f9c649956d48c5cfdeffdc70cb188711ef3a5d1d73c7c4f3a6dacd';

$payload = [
    'amount' => $amount,
    'description' => $produto,
    'reference' => $refId,
    'source' => 'api_externa',
    'customer' => [
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'document' => $cpf
    ],
    'tracking' => [
        'utm_source' => $utm['utm_source'] ?? '',
        'utm_medium' => $utm['utm_medium'] ?? '',
        'utm_campaign' => $utm['utm_campaign'] ?? '',
        'utm_content' => $utm['utm_content'] ?? '',
        'utm_term' => $utm['utm_term'] ?? '',
        'src' => $utm['src'] ?? '',
        'sck' => $utm['sck'] ?? ''
    ]
];

$ch = curl_init('https://app.pingupag.com/gateway/v1/transaction');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'X-API-Key: ' . $apiKey
    ],
    CURLOPT_TIMEOUT => 25
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode((string) $response, true);
if ($httpCode < 200 || $httpCode >= 300 || empty($data['qr_code'])) {
    $errMsg = (string) ($data['message'] ?? $data['error'] ?? 'PinguPag recusou a criacao do PIX');
    json_response(['success' => false, 'error' => $errMsg, 'raw' => $data], 502);
}

$code = (string) ($data['qr_code'] ?? '');
$transacaoId = (string) ($data['transaction_id'] ?? $data['id'] ?? $refId);

json_response([
    'success' => true,
    'pixCode' => $code,
    'qrCode' => $code,
    'qr_code' => $code,
    'qr_code_base64' => (string) ($data['qr_code_base64'] ?? ''),
    'pix_copia_e_cola' => $code,
    'transacao_id' => $transacaoId,
    'id' => $transacaoId,
    'status' => 'PENDING'
]);
