<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
	http_response_code(204);
	exit;
}

$storageDir = __DIR__ . DIRECTORY_SEPARATOR . 'documents';

if (!is_dir($storageDir) && !mkdir($storageDir, 0775, true) && !is_dir($storageDir)) {
	respond(500, ['error' => 'Unable to initialize storage directory.']);
}

try {
	switch ($method) {
		case 'GET':
			handleGet($storageDir);
			break;
		case 'POST':
		case 'PUT':
			handlePutOrPost($storageDir);
			break;
		default:
			respond(405, ['error' => 'Method not allowed.']);
	}
} catch (RuntimeException $exception) {
	respond(400, ['error' => $exception->getMessage()]);
} catch (Throwable $exception) {
	respond(500, ['error' => 'Internal server error.']);
}

function handleGet(string $storageDir): void
{
	$id = $_GET['id'] ?? null;
	$prefix = $_GET['prefix'] ?? null;

	if (is_string($id) && $id !== '') {
		$filePath = buildDocumentPath($storageDir, $id);

		if (!is_file($filePath)) {
			respond(404, ['error' => 'Document not found.']);
		}

		// Update the file's modified timestamp (like `touch`)
		if (!touch($filePath)) {
			respond(500, ['error' => 'Unable to update document timestamp.']);
		}

		$result = getDocument($filePath);
		respond(200, $result);
	}

	if (is_string($prefix) && $prefix !== '') {
		$documentList = [];
		foreach (glob($storageDir . DIRECTORY_SEPARATOR . $prefix . '*.json') ?: [] as $filePath) {

			$id = pathinfo($filePath, PATHINFO_FILENAME);

			try {
				$result = [
					'id' => $id,
					'created' => filectime($filePath),
					'modified' => filemtime($filePath),
					'document' => getDocument($filePath)];
				$documentList[] = $result;
			} catch (RuntimeException $e) {
				// Skip invalid documents
			}
		}

		respond(200, $documentList);
	}

	$documentList = [];
	foreach (glob($storageDir . DIRECTORY_SEPARATOR . '*.json') ?: [] as $filePath) {

		$id = pathinfo($filePath, PATHINFO_FILENAME);

		try {
			$result = ['id' => $id, 'document' => getDocument($filePath)];
			$documentList[] = $result;
		} catch (RuntimeException $e) {
			// Skip invalid documents
		}
	}

	respond(200, $documentList);
}

function getDocument(string $filePath): mixed
{
	if (!is_file($filePath)) {
		throw new RuntimeException('Document not found.');
	}

	$raw = file_get_contents($filePath);
	try {
		return json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
	} catch (JsonException $e) {
		throw new RuntimeException('Stored document contains invalid JSON.');
	}
}

function handlePutOrPost(string $storageDir): void
{
	$payload = readJsonBody(allowEmpty: false);

	if (!is_array($payload)) {
		throw new RuntimeException('PUT body must be a JSON object.');
	}

	$id = $_GET['id'] ?? null;
	if (!is_string($id) || $id === '') {
		$guid = generateGuidV4();

		$prefix = (isset($payload['prefix']) && $payload['prefix'] !== '')
			? $payload['prefix'] . "_"
			: '';

		$id = $prefix . $guid;
	}

	$filePath = buildDocumentPath($storageDir, $id);
	$exists = is_file($filePath);
	writeDocument($filePath, $payload['ftd']);

	if (!$exists) {
		header('Location: ' . buildResourceLocation($id));
		respond(201, []);
	} else {
		respond(200, [
			'id' => $id,
			'document' => $payload['ftd']
		]);
	}
}

function readJsonBody(bool $allowEmpty): mixed
{
	$raw = file_get_contents('php://input');

	if ($raw === false) {
		throw new RuntimeException('Unable to read request body.');
	}

	if (trim($raw) === '') {
		if ($allowEmpty) {
			return null;
		}
		throw new RuntimeException('Request body is required and must be valid JSON.');
	}

	try {
		return json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
	} catch (JsonException $exception) {
		throw new RuntimeException('Request body must be valid JSON.');
	}
}

function writeDocument(string $filePath, mixed $document): void
{
	$json = json_encode($document, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
	file_put_contents($filePath, $json . PHP_EOL, LOCK_EX);
}

function buildDocumentPath(string $storageDir, string $guid): string
{
	return $storageDir . DIRECTORY_SEPARATOR . $guid . '.json';
}

function generateGuidV4(): string
{
	$data = random_bytes(16);
	$data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
	$data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

	return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function buildResourceLocation(string $guid): string
{
	return $_SERVER['SCRIPT_URI'] . '?id=' . rawurlencode($guid);
}

function respond(int $statusCode, array $payload): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
	exit;
}
