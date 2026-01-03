import { useState, useEffect } from 'react'
import { updateClient } from '../../services/clientService'
import { DATA_MAPPING } from '../../utils/clientFields'
import Parse from '../../services/back4app'
import { FaTimes, FaCloudUploadAlt } from 'react-icons/fa'

export default function EditClientModal({ client, isOpen, onClose, onUpdate }) {
    const [editingClient, setEditingClient] = useState(null)
    const [filesToUpload, setFilesToUpload] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (client) {
            setEditingClient({ ...client })
        }
    }, [client])

    if (!isOpen || !editingClient) return null

    const handleFileChange = (e, key) => {
        if (e.target.files && e.target.files[0]) {
            setFilesToUpload(prev => ({ ...prev, [key]: e.target.files[0] }))
        }
    }

    const saveEditedClient = async () => {
        try {
            if (!window.confirm('هل أنت متأكد من حفظ التعديلات؟')) return

            setLoading(true)
            let updatedClient = { ...editingClient }

            // Upload files if any (Back4App)
            if (Object.keys(filesToUpload).length > 0) {
                for (const [key, file] of Object.entries(filesToUpload)) {
                    try {
                        const name = `${Date.now()}_${key}_${file.name.replace(/\s/g, '_')}`;
                        const parseFile = new Parse.File(name, file);
                        const savedFile = await parseFile.save();
                        updatedClient[key] = savedFile.url();
                    } catch (uploadError) {
                        console.error(`Error uploading ${key}:`, uploadError)
                        alert(`فشل رفع الملف: ${key}`)
                        setLoading(false)
                        return // Stop save if upload fails
                    }
                }
            }

            await updateClient(editingClient.id, updatedClient)

            if (onUpdate) {
                onUpdate(updatedClient)
            }

            setFilesToUpload({})
            onClose()
            alert('تم حفظ التعديلات بنجاح!')
        } catch (error) {
            console.error("Error updating client:", error)
            alert("فشل الحفظ")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-gray-700">
                <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b dark:border-gray-800 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold dark:text-white">تعديل بيانات العميل</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-3xl">&times;</button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(DATA_MAPPING).map(([key, headers]) => {
                        const FILE_KEYS = ['PhotoFront', 'PhotoSide', 'PhotoBack', 'TestsFile', 'XrayFile', 'LastDietFile']
                        const isFile = FILE_KEYS.includes(key)
                        return (
                            <div key={key} className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {headers[headers.length - 1]}
                                </label>
                                {isFile ? (
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border dark:border-gray-700">
                                        {/* Logic for File: Preview Existing or Upload New */}
                                        {editingClient[key] && typeof editingClient[key] === 'string' ? (
                                            <div className="relative group w-fit">
                                                <a href={editingClient[key]} target="_blank" rel="noreferrer" className="block">
                                                    <img
                                                        src={editingClient[key]}
                                                        alt={key}
                                                        className="h-24 w-24 object-cover rounded shadow-sm"
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                                                    />
                                                    <div className="hidden h-24 w-24 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-xs text-center rounded p-1 text-gray-500">
                                                        ملف (اضغط للعرض)
                                                    </div>
                                                </a>
                                                <button
                                                    onClick={() => setEditingClient(prev => ({ ...prev, [key]: '' }))}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-600"
                                                    title="حذف الملف"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <FaCloudUploadAlt className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">اضغط للرفع</p>
                                                    </div>
                                                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, key)} />
                                                </label>
                                                {filesToUpload[key] && (
                                                    <span className="text-xs text-green-600 truncate max-w-[200px]">
                                                        جاهز للرفع: {filesToUpload[key].name}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        value={editingClient[key] || ''}
                                        onChange={(e) => setEditingClient(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-gray-900 p-6 border-t dark:border-gray-800 flex justify-end gap-3 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={saveEditedClient}
                        disabled={loading}
                        className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow-lg shadow-primary/20"
                    >
                        {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </button>
                </div>
            </div>
        </div>
    )
}
