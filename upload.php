<?php
// Cấu hình
ini_set('memory_limit', '256M');
ini_set('upload_max_filesize', '200M');
ini_set('post_max_size', '210M');
ini_set('max_execution_time', 300);

header('Content-Type: application/json');

$uploadDir = 'uploads/';
$chunkDir = 'chunks/';

// Tạo thư mục nếu chưa tồn tại
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}
if (!file_exists($chunkDir)) {
    mkdir($chunkDir, 0777, true);
}

// Xử lý hoàn tất upload
if (isset($_GET['complete'])) {
    $fileName = basename($_GET['complete']);
    $filePath = $uploadDir . $fileName;
    
    // Kiểm tra xem tất cả chunk đã được upload chưa
    $chunkPattern = $chunkDir . $fileName . '_*';
    $chunks = glob($chunkPattern);
    
    if (empty($chunks)) {
        echo json_encode(['success' => false, 'error' => 'Không tìm thấy chunk']);
        exit;
    }
    
    // Ghép các chunk lại
    $fp = fopen($filePath, 'wb');
    if ($fp) {
        // Sắp xếp chunk theo thứ tự
        natsort($chunks);
        foreach ($chunks as $chunk) {
            fwrite($fp, file_get_contents($chunk));
            unlink($chunk);
        }
        fclose($fp);
        
        // Trả về thông tin file
        $fileInfo = [
            'name' => $fileName,
            'size' => filesize($filePath),
            'type' => mime_content_type($filePath),
            'path' => $filePath,
            'uploaded' => date('Y-m-d H:i:s')
        ];
        
        echo json_encode(['success' => true, 'file' => $fileInfo]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Không thể tạo file']);
    }
    exit;
}

// Xử lý upload chunk
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!isset($_FILES['file']['tmp_name'])) {
            throw new Exception('Không nhận được file');
        }
        
        $fileName = $_POST['fileName'];
        $chunkIndex = (int)$_POST['chunkIndex'];
        $totalChunks = (int)$_POST['totalChunks'];
        
        // Lưu chunk tạm thời
        $chunkName = $chunkDir . $fileName . '_' . str_pad($chunkIndex, 4, '0', STR_PAD_LEFT);
        move_uploaded_file($_FILES['file']['tmp_name'], $chunkName);
        
        echo json_encode([
            'success' => true,
            'chunk' => $chunkIndex,
            'total' => $totalChunks
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit;
}

// API lấy danh sách file
if (isset($_GET['list'])) {
    $files = [];
    foreach (glob($uploadDir . '*') as $file) {
        if (is_file($file)) {
            $files[] = [
                'name' => basename($file),
                'size' => filesize($file),
                'type' => mime_content_type($file),
                'modified' => date('Y-m-d H:i:s', filemtime($file))
            ];
        }
    }
    echo json_encode($files);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Invalid request']);
