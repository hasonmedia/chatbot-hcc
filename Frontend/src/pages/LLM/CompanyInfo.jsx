import { useState, useEffect, useRef } from "react";
import { Building, Upload, Phone, RotateCcw } from "lucide-react";
import { getCompanyById, updateCompany, uploadLogo } from '../../services/companyService';

const CompanyInfo = ({ companyId = 1 }) => {
    const [companyData, setCompanyData] = useState({
        name: '',
        logo_url: '',
        contact: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [previewImage, setPreviewImage] = useState(''); // Lưu base64 để preview
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const data = await getCompanyById(companyId);
                if (data && !data.message) {
                    setCompanyData({
                        name: data.name || '',
                        logo_url: data.logo_url || '',
                        contact: data.contact || ''
                    });
                }
            } catch (error) {
                console.error("Không thể tải thông tin công ty:", error);
            }
        };
        
        fetchCompany();
    }, [companyId]);

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        
        try {
            let logoUrl = companyData.logo_url;
            
            // Nếu có ảnh preview (base64), upload lên server trước
            if (previewImage) {
                try {
                    const uploadResult = await uploadLogo(previewImage);
                    logoUrl = uploadResult.image_urls[0]; // Lấy URL đầu tiên
                    setPreviewImage(''); // Clear preview sau khi upload thành công
                } catch (uploadError) {
                    console.error('Upload error:', uploadError);
                    setMessage('Có lỗi khi upload logo ❌');
                    return;
                }
            }
            
            await updateCompany(companyId, {
                ...companyData,
                logo_url: logoUrl
            });
            
            // Cập nhật state với URL mới
            setCompanyData(prev => ({
                ...prev,
                logo_url: logoUrl
            }));
            
            setMessage('Cập nhật thông tin công ty thành công ✅');
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            setMessage('Có lỗi khi cập nhật thông tin công ty ❌');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setCompanyData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetToDefault = () => {
        const defaultContact = `📞 Hotline: 1900-123-456
📧 Email: contact@company.com  
📍 Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM
🌐 Website: www.company.com
⏰ Giờ làm việc: 8:00 - 17:30 (T2-T6)`;
        
        setCompanyData(prev => ({
            ...prev,
            contact: defaultContact
        }));
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Kiểm tra file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setMessage('File ảnh quá lớn. Vui lòng chọn file nhỏ hơn 2MB ❌');
                return;
            }

            // Kiểm tra file type
            if (!file.type.startsWith('image/')) {
                setMessage('Vui lòng chọn file ảnh hợp lệ ❌');
                return;
            }

            // Convert to base64 để preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64String = e.target.result;
                setPreviewImage(base64String); // Lưu vào preview state
                setMessage('Ảnh đã được chọn. Ấn "Lưu thông tin" để cập nhật ✅');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6">
            {/* Company Name Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Tên công ty</h3>
                </div>
                <input
                    type="text"
                    value={companyData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nhập tên công ty..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Company Logo Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Logo công ty</h3>
                </div>
                
                <div className="space-y-3">
                    {(previewImage || companyData.logo_url) ? (
                        // Hiển thị logo hiện tại hoặc preview với option thay đổi
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                <img
                                    src={previewImage || companyData.logo_url}
                                    alt="Company Logo"
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => {
                                        e.target.src = '';
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = '<Building className="w-8 h-8 text-gray-400" />';
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-600 mb-2">
                                    {previewImage ? 'Ảnh đã chọn (chưa lưu)' : 'Logo hiện tại'}
                                </p>
                                {previewImage && (
                                    <p className="text-xs text-orange-600 mb-2">
                                        Ấn "Lưu thông tin" để cập nhật logo
                                    </p>
                                )}
                                <button
                                    onClick={handleUploadClick}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {previewImage ? 'Chọn ảnh khác' : 'Thay đổi logo'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Nút upload khi chưa có logo
                        <div 
                            onClick={handleUploadClick}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium mb-2">Upload logo công ty</p>
                            <p className="text-sm text-gray-500">
                                Chọn file ảnh (PNG, JPG, SVG) - Kích thước tối đa 2MB
                            </p>
                        </div>
                    )}
                    
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Thông tin liên hệ</h3>
                    </div>
                    <button
                        onClick={resetToDefault}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Mẫu mặc định
                    </button>
                </div>

                <div className="space-y-3">
                    <textarea
                        value={companyData.contact}
                        onChange={(e) => handleInputChange('contact', e.target.value)}
                        rows={8}
                        placeholder="Nhập thông tin liên hệ..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <div className="text-sm text-gray-500 text-right">
                        {companyData.contact?.length || 0} ký tự
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            Lưu thông tin
                        </>
                    )}
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                    message.includes("thành công")
                        ? "bg-green-50 text-green-800 border-green-200"
                        : "bg-red-50 text-red-800 border-red-200"
                }`}>
                    <span className="font-medium">{message}</span>
                </div>
            )}

            {/* Tips */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">💡</span>
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-800 text-sm mb-2">Gợi ý:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Logo nên có kích thước phù hợp và chất lượng cao</li>
                            <li>• Thông tin liên hệ nên bao gồm đầy đủ: điện thoại, email, địa chỉ</li>
                            <li>• Có thể sử dụng emoji để làm nổi bật thông tin</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyInfo;