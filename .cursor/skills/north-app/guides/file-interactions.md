# 文件交互

## 文件类型定义

```typescript
export interface DriveFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  filetype?: string;       // 文件扩展名
  isFolder: boolean;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
  parentId?: string;       // 父文件夹 ID
  path?: string;           // 文件路径
}

export interface UploadFileResult {
  id: string;
  name: string;
  url: string;
  size: number;
}

export interface ListDriveFilesResult {
  files: DriveFile[];
  total: number;
  page: number;
  size: number;
  hasMore: boolean;
}
```

## 列出工作空间文件

```typescript
async listDriveFiles(
  parentId?: string | null,
  options: { q?: string; page?: number; limit?: number } = {},
): Promise<ListDriveFilesResult> {
  const result = await this.sdk.callXiaobeiAPI('listDriveFiles', {
    parentId: parentId ?? null,
    q: options.q,
    page: options.page ?? 1,
    limit: options.limit ?? 50,
  });

  return {
    files: result.files ?? [],
    total: result.total ?? result.files?.length ?? 0,
    page: result.page ?? 1,
    size: result.size ?? result.files?.length ?? 0,
    hasMore: result.hasMore ?? false,
  };
}
```

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `parentId` | `string \| null` | 父文件夹 ID，null 表示根目录 |
| `q` | `string` | 搜索关键词 |
| `page` | `number` | 页码，默认 1 |
| `limit` | `number` | 每页数量，默认 50 |

## 文件选择器组件

```tsx
export function SDKFileSelectorDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (files: DriveFile[]) => void;
}) {
  const hostAPI = useHostAPI();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [folderContents, setFolderContents] = useState<Record<string, DriveFile[]>>({});

  // 加载根目录文件
  const loadRootFiles = async () => {
    setLoading(true);
    try {
      const result = await hostAPI.listDriveFiles(null, { limit: 100 });
      setFiles(result.files);
    } finally {
      setLoading(false);
    }
  };

  // 打开时加载
  useEffect(() => {
    if (open) {
      loadRootFiles();
      setSelectedFiles([]);
    }
  }, [open]);

  // 展开/折叠文件夹
  const toggleFolder = async (folder: DriveFile) => {
    const folderId = folder.id;
    const newExpanded = new Set(expandedFolders);

    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
      // 加载子文件（如果未缓存）
      if (!folderContents[folderId]) {
        const children = await hostAPI.listDriveFiles(folderId, { limit: 100 });
        setFolderContents(prev => ({ ...prev, [folderId]: children.files }));
      }
    }

    setExpandedFolders(newExpanded);
  };

  // 选择文件
  const toggleFileSelection = (file: DriveFile) => {
    if (file.isFolder) return;
    
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.id === file.id);
      if (isSelected) {
        return prev.filter(f => f.id !== file.id);
      }
      return [...prev, file];
    });
  };

  // 确认选择
  const handleConfirm = () => {
    onSelect(selectedFiles);
    onOpenChange(false);
  };

  // 递归渲染文件树
  const renderFileTree = (files: DriveFile[], level = 0) => (
    <div style={{ paddingLeft: level * 16 }}>
      {files.map(file => (
        <div key={file.id}>
          <div
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer',
              selectedFiles.some(f => f.id === file.id) && 'bg-blue-50'
            )}
            onClick={() => file.isFolder ? toggleFolder(file) : toggleFileSelection(file)}
          >
            {file.isFolder ? (
              <>
                <ChevronIcon expanded={expandedFolders.has(file.id)} />
                <YellowFolderIcon className="h-4 w-4" />
              </>
            ) : (
              <FileIcon className="h-4 w-4" />
            )}
            <span className="text-sm truncate">{file.name}</span>
            {!file.isFolder && file.size && (
              <span className="text-xs text-gray-400 ml-auto">
                {formatFileSize(file.size)}
              </span>
            )}
          </div>
          
          {/* 子文件夹内容 */}
          {file.isFolder && expandedFolders.has(file.id) && folderContents[file.id] && (
            renderFileTree(folderContents[file.id], level + 1)
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>选择文件</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            renderFileTree(files)
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-sm text-gray-500">
            已选择 {selectedFiles.length} 个文件
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button onClick={handleConfirm} disabled={selectedFiles.length === 0}>
              确认
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## 文件上传

### 上传实现

```typescript
async uploadFile(file: File): Promise<UploadFileResult | null> {
  // 1. 文件大小检查（20MB）
  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    console.warn('[HostAPI] 文件超过 20MB 限制');
    return null;
  }

  // 2. 转换为 base64
  const fileData = await this.fileToBase64(file);

  // 3. 通过 SDK 上传（带超时）
  const timeoutMs = 60000;
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('上传超时')), timeoutMs);
  });

  try {
    const result = await Promise.race([
      this.sdk.uploadFile({
        fileData,
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
      }),
      timeoutPromise,
    ]);

    return {
      id: result.file_uri || crypto.randomUUID(),
      name: result.file_name || file.name,
      url: result.file_uri || '',
      size: file.size,
    };
  } catch (error) {
    console.error('[HostAPI] 上传失败:', error);
    return null;
  }
}

private async fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // 移除 data:xxx;base64, 前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### 上传状态管理

```tsx
interface LocalUploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  file?: File;
  uploading: boolean;
  error?: string;
  fileUri?: string;
}

const [uploadedFiles, setUploadedFiles] = useState<LocalUploadedFile[]>([]);

const handleFileUpload = async (files: FileList | null) => {
  if (!files) return;

  // 1. 创建本地状态（uploading: true）
  const newFiles: LocalUploadedFile[] = Array.from(files).map((file) => ({
    id: crypto.randomUUID(),
    name: file.name,
    size: formatFileSize(file.size),
    type: file.type.split('/').pop() ?? 'file',
    file,
    uploading: true,
  }));

  setUploadedFiles((prev) => [...prev, ...newFiles]);

  // 2. 逐个上传
  for (const uploadedFile of newFiles) {
    try {
      const result = await hostAPI.uploadFile(uploadedFile.file!);
      
      // 3. 更新状态
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, uploading: false, fileUri: result?.url }
            : f
        )
      );
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, uploading: false, error: '上传失败' }
            : f
        )
      );
    }
  }
};
```

## 获取文件下载 URL

```typescript
async getFileDownloadUrl(
  path: string,
  threadId?: string,
): Promise<string | null> {
  try {
    // 优先通过 SDK 调用宿主 API
    if (this.sdk.callXiaobeiAPI) {
      const result = await this.sdk.callXiaobeiAPI('getFileDownloadUrl', {
        path,
        threadId,
      });
      
      if (result?.success && result?.url) {
        return result.url;
      }
    }

    // 降级：直接调用后端 API
    const apiResult = await fetch('/api/drive/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, thread_id: threadId }),
    });

    const data = await apiResult.json();
    return data?.url || null;
  } catch (error) {
    console.error('[HostAPI] 获取下载 URL 失败:', error);
    return null;
  }
}
```

### 使用示例：PPT 图片加载

```tsx
const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
const [loadingImages, setLoadingImages] = useState(true);

useEffect(() => {
  async function loadImageUrls() {
    if (!data?.slides) return;
    
    setLoadingImages(true);
    const urls: Record<string, string> = {};

    await Promise.all(
      data.slides.map(async (slide) => {
        // 已经是完整 URL，直接使用
        if (slide.imageUrl.startsWith('http://') || 
            slide.imageUrl.startsWith('https://')) {
          urls[slide.imageUrl] = slide.imageUrl;
          return;
        }

        // 通过 HostAPI 获取下载 URL
        const downloadUrl = await hostAPI.getFileDownloadUrl(slide.imageUrl);
        if (downloadUrl) {
          urls[slide.imageUrl] = downloadUrl;
        }
      })
    );

    setImageUrls(urls);
    setLoadingImages(false);
  }

  loadImageUrls();
}, [data?.slides, hostAPI]);
```

## 最佳实践

### 1. 文件大小限制

```typescript
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

if (file.size > MAX_FILE_SIZE) {
  toast.error(`${file.name} 超过 20MB 限制`);
  return;
}
```

### 2. 文件类型过滤

```tsx
<input
  type="file"
  accept=".pdf,.doc,.docx,.txt,.md"
  onChange={(e) => handleFileUpload(e.target.files)}
/>
```

### 3. 缓存文件夹内容

```typescript
const [folderContents, setFolderContents] = useState<Record<string, DriveFile[]>>({});

// 只在未缓存时加载
if (!folderContents[folderId]) {
  const children = await hostAPI.listDriveFiles(folderId);
  setFolderContents(prev => ({ ...prev, [folderId]: children.files }));
}
```

### 4. 并行加载 URL

```typescript
// 使用 Promise.all 并行获取所有 URL
await Promise.all(
  files.map(async (file) => {
    const url = await hostAPI.getFileDownloadUrl(file.path);
    // ...
  })
);
```

### 5. 错误处理和降级

```typescript
try {
  // 优先使用 SDK
  const result = await this.sdk.callXiaobeiAPI('getFileDownloadUrl', { path });
  if (result?.url) return result.url;
} catch (error) {
  console.warn('[HostAPI] SDK 调用失败，尝试降级方案');
}

// 降级到直接 API 调用
try {
  const result = await fetch('/api/download', { ... });
  return result?.url;
} catch {
  return null;
}
```
