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

$amountBrl = round($amount / 100, 2);

$customer = is_array($input['customer'] ?? null) ? $input['customer'] : [];
$name = trim((string) ($customer['name'] ?? $input['nome_pagador'] ?? 'Cliente Mercado Livre')) ?: 'Cliente Mercado Livre';
$email = filter_var((string) ($customer['email'] ?? $input['email_pagador'] ?? ''), FILTER_VALIDATE_EMAIL) ?: 'contato@cliente.com';
$cpf = preg_replace('/\D+/', '', (string) ($customer['cpf'] ?? $customer['document'] ?? $input['cpf_pagador'] ?? '52998224725'));
if (strlen($cpf) !== 11) {
    $cpf = '52998224725';
}
$phone = preg_replace('/\D+/', '', (string) ($customer['phone'] ?? $input['telefone_pagador'] ?? '11999998888')) ?: '11999998888';
$produto = substr(trim((string) ($input['produto'] ?? $input['description'] ?? 'Caixa JBL Boombox 4')), 0, 140);
$externalId = 'ord-' . time() . '-' . mt_rand(1000, 9999);

$token = env_value('LULAPAY_TOKEN') ?: 'gwk_c25fff532aaa9ca37b2187ea884c991a2b6114d7ca6b3125';

$payload = [
    'amount' => $amountBrl,
    'description' => $produto,
    'external_id' => $externalId,
    'customer_name' => $name,
    'customer_email' => $email,
    'customer_phone' => $phone,
    'customer_document' => $cpf
];

$ch = curl_init('https://lulapay.onrender.com/api/v1/cobranca.php');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ],
    CURLOPT_TIMEOUT => 25
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode((string) $response, true);

if (($httpCode === 200 || $httpCode === 201) && !empty($data['pix_code'])) {
    $pixCode = $data['pix_code'];
    $txid = (string) ($data['id'] ?? $externalId);
    $qrBase64 = $data['qr_image'] ?? '';
    $qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' . rawurlencode($pixCode);

    json_response([
        'success' => true,
        'transacao_id' => $txid,
        'id' => $txid,
        'txid' => $txid,
        'pixCode' => $pixCode,
        'qrCode' => $pixCode,
        'pix_code' => $pixCode,
        'qr_code' => $pixCode,
        'pix_copia_e_cola' => $pixCode,
        'qrcode' => $pixCode,
        'base64QrCode' => $qrBase64,
        'qr_code_base64' => $qrBase64,
        'qr_code_url' => $qrUrl,
        'valor' => number_format($amountBrl, 2, '.', ''),
        'status' => 'PENDING'
    ]);
} else {
    json_response([
        'success' => false,
        'error' => $data['error'] ?? $data['message'] ?? 'Erro ao gerar Pix na LulaPay',
        'detalhes' => $data
    ], 400);
}
