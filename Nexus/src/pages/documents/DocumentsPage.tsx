import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileText, Upload, Download, Trash2, Share2, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

// Axios instance (ensure this matches your auth config)
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "recent" | "shared">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const STORAGE_LIMIT_MB = 100;

  // 1. Fetch Documents on Mount
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/document/documents');
      if (res.data.success) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      setError("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // calculate total storage used
  const totalUsedMB = useMemo(() => {
    return documents.reduce((acc, doc) => {
      const sizeStr = doc.size || "0";
      const numericSize = parseFloat(sizeStr.replace(/[^\d.]/g, ''));
      return acc + (isNaN(numericSize) ? 0 : numericSize);
    }, 0);
  }, [documents]);

  // filter documents based on selection
  const filteredDocuments = useMemo(() => {
    switch (activeFilter) {
      case "recent":
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return documents.filter(doc => new Date(doc.lastModified) > sevenDaysAgo);
      case "shared":
        return documents.filter(doc => doc.shared);
      default:
        return documents;
    }
  }, [documents, activeFilter]);

  // 2. Handle File Upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if(file.size > 20 * 1024 * 1024 ) {
      toast.error("File size exceeds 20MB limit.")
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('name', file.name);
    formData.append('type', file.type.split('/')[1].toUpperCase());
    formData.append('size', `${(file.size / (1024 * 1024)).toFixed(2)}MB`);

    try {
      setIsUploading(true);
      const res = await api.post('/document/upload', formData);
      if (res.data.success) {
        setDocuments([res.data.document, ...documents]);
        toast.success("File uploaded successfully.");
      } else {
        toast.error("File upload failed.");
      }
    } catch (err) {
      toast.error("File upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Toggle Sharing
  const handleToggleShare = async (id: string) => {
    try {
      const res = await api.put(`/document/${id}/share`);
      if (res.data.success) {
      const updatedDoc = res.data.document; // Extract the updated doc
      
      setDocuments(documents.map(doc => 
        (doc.id === id || doc._id === id) ? updatedDoc : doc
      ));

      toast.success(updatedDoc.shared ? "Document Shared" : "Document Unshared");
    } else {
      toast.error("Document Share failed.");
    }
  } catch (err) {
    console.error("Sharing failed", err);
    toast.error("An error occurred while sharing.");
  }
};

  // 4. Delete Document
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await api.delete(`/document/${id}`);
      if (res.data.success) {
        setDocuments(documents.filter(doc => doc.id !== id && doc._id !== id));
        toast.success("File deleted successfully.");
      } else {
        toast.error("File deletion failed.");
      }
    } catch (err) {
      toast.error("File deletion failed.");
    }
  };

  // 5. Download Document
  const handleDownload = async (doc: any) => {
  const toastId = toast.loading("Downloading...");
  try {
    // Create a hidden anchor tag, click it, and remove it
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Download complete!", { id: toastId });
  } catch (error) {
    console.error("Download failed", error);
    toast.error("Failed to download file.", { id: toastId });
  }
};

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-600" size={40} /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your startup's important files</p>
        </div>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleUpload} 
        />
        
        <Button 
          leftIcon={isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
      
      {error && (
        <div className="bg-error-50 p-4 rounded-md text-error-700 flex items-center">
          <AlertCircle className="mr-2" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Storage info (Calculated dynamically) */}
        <Card className="lg:col-span-1">
          <CardHeader><h2 className="text-lg font-medium text-gray-900">Storage</h2></CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">{totalUsedMB.toFixed(2)} MB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-600 rounded-full" style={{ width: `${Math.min(documents.length * 10, 100)}%` }}>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Limit</span>
                <span className="font-medium text-gray-900">
                  {STORAGE_LIMIT_MB} MB
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Access</h3>
              <div className="space-y-1">
                {(["all", "recent", "shared"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md capitalize transition-colors ${
                      activeFilter === filter ? "text-primary-700 bg-primary-50 font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {filter === "all" ? "All Files" : filter === "recent" ? "Recent Files" : "Shared for Investors"}
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
        
        {/* Document list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                >
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No documents found. Upload your first pitch deck!</div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => {
                    const docId = doc.id || doc._id;
                    return (
                      <div key={docId} className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="p-2 bg-primary-50 rounded-lg mr-4">
                          <FileText size={24} className="text-primary-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h3>
                            {doc.shared && <Badge variant="secondary" size="sm">Shared</Badge>}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>{doc.type}</span>
                            <span>{doc.size}</span>
                            <span>Modified {new Date(doc.lastModified).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">

                          <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          aria-label="Download"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download size={18} />
                        </Button>        
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`p-2 ${doc.shared ? 'text-primary-600' : ''}`}
                            onClick={() => handleToggleShare(docId)}
                          >
                            <Share2 size={18} />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-2 text-error-600 hover:text-error-700"
                            onClick={() => handleDelete(docId)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};