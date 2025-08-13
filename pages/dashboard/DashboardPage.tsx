import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context';
import { getMockUserById } from '@/data';
import type { User, ApplicationCardData } from '@/types';
import { Card, Icon, Button, Modal, FormField } from '@/components/ui';
import { v4 as uuidv4 } from 'uuid';

const ApplicationCard: React.FC<ApplicationCardData & { cardSize?: string }> = ({ name, description, iconName, launchUrl, cardSize }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLaunch = () => {
    // Create query string for view-as mode
    const viewAsQueryString = searchParams.get('viewAsUser') 
      ? `?viewAsUser=${searchParams.get('viewAsUser')}&returnTo=${encodeURIComponent(searchParams.get('returnTo') || '')}` 
      : '';

    if (launchUrl.startsWith('http')) {
      window.open(launchUrl, '_blank');
    } else if (launchUrl.startsWith('/')) {
      navigate(`${launchUrl}${viewAsQueryString}`);
    } else {
       if (launchUrl === '#email-admin-subs') {
        navigate(`/app/billing/email-subscriptions${viewAsQueryString}`); 
      } else if (launchUrl === '#cloudedge-configs') {
        navigate(`/app/billing/cloudedge-configurations${viewAsQueryString}`); 
      } else {
        alert(`Action for: ${name}`);
      }
    }
  };

  const isImageUrl = iconName.startsWith('http') || iconName.startsWith('/');

  return (
    <Card className={`flex flex-col h-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg border border-gray-300/70 dark:border-slate-600/50 rounded-xl p-6 transition-all hover:border-gray-400 dark:hover:border-slate-500 ${cardSize}`}>
      <div className="flex-grow">
        <div className="flex items-center space-x-3 mb-3">
          {isImageUrl ? (
            <img src={iconName} alt={`${name} icon`} className="h-8 w-auto" />
          ) : (
            <Icon name={iconName} className="text-2xl text-[#679a41] dark:text-emerald-400" />
          )}
          <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">{name}</h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{description}</p>
      </div>
      <div className="mt-auto">
         <hr className="my-4 border-gray-200/50 dark:border-gray-700/50" />
        <Button variant="primary" fullWidth onClick={handleLaunch}>
          View {name}
        </Button>
      </div>
    </Card>
  );
};

// Define Contact type
interface Contact {
    id: string;
    title: string;
    name: string;
    details: string[];
}

// Modal for adding/editing contacts
interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: Omit<Contact, 'id'>) => void;
    contact: Contact | null;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSave, contact }) => {
    const [formData, setFormData] = useState({
        title: '',
        name: '',
        details: ['']
    });

    useEffect(() => {
        if(isOpen) {
            setFormData({
                title: contact?.title || '',
                name: contact?.name || '',
                details: contact?.details && contact.details.length > 0 ? [...contact.details] : ['']
            });
        }
    }, [contact, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDetailChange = (index: number, value: string) => {
        const newDetails = [...formData.details];
        newDetails[index] = value;
        setFormData(prev => ({ ...prev, details: newDetails }));
    };

    const handleAddDetailField = () => {
        setFormData(prev => ({ ...prev, details: [...prev.details, ''] }));
    };

    const handleRemoveDetailField = (index: number) => {
        if (formData.details.length > 1) {
            setFormData(prev => ({ ...prev, details: prev.details.filter((_, i) => i !== index) }));
        }
    };

    const handleSubmit = () => {
        const filledDetails = formData.details.filter(d => d.trim() !== '');
        if (formData.name && formData.title) {
            onSave({ ...formData, details: filledDetails });
        } else {
            alert('Please fill title and name.');
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            title={contact ? 'Edit Contact' : 'Add New Contact'}
            footer={
                <>
                    <Button onClick={handleSubmit}>Save</Button>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField id="title" name="title" label="Title" value={formData.title} onChange={handleChange} required />
                <FormField id="name" name="name" label="Name" value={formData.name} onChange={handleChange} required />
                
                {formData.details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="flex-grow">
                             <FormField 
                                id={`details-${index}`} 
                                name={`details-${index}`} 
                                label={'Details (Email/Phone)'}
                                value={detail} 
                                onChange={(e) => handleDetailChange(index, e.target.value)} 
                                required={false}
                                wrapperClassName="mb-0"
                            />
                        </div>
                        {formData.details.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveDetailField(index)}
                                className="flex-shrink-0 mt-6"
                                aria-label="Remove detail"
                            >
                                <Icon name="fas fa-trash-alt" className="text-red-500" />
                            </Button>
                        )}
                    </div>
                ))}
                
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDetailField}
                    leftIconName="fas fa-plus"
                >
                    Add Detail
                </Button>
            </div>
        </Modal>
    );
};


const ContactView: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([
        { id: 'c1', title: 'Billing Contact', name: 'John Doe', details: ['billing@alpha.inc'] },
        { id: 'c2', title: 'Technical Contact', name: 'Jane Smith', details: ['tech@alpha.inc'] },
        { id: 'c3', title: 'Primary Contact', name: 'Demo Customer Alpha', details: ['customer@worldposta.com'] }
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const handleOpenModal = (contact: Contact | null = null) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingContact(null);
    };

    const handleSaveContact = (contactData: Omit<Contact, 'id'>) => {
        if (editingContact) {
            setContacts(contacts.map(c => c.id === editingContact.id ? { ...editingContact, ...contactData } : c));
        } else {
            setContacts([...contacts, { id: uuidv4(), ...contactData }]);
        }
        handleCloseModal();
    };
    
    const handleDeleteContact = (contactId: string) => {
        if (window.confirm("Are you sure you want to delete this contact?")) {
            setContacts(contacts.filter(c => c.id !== contactId));
        }
    };

    return (
        <>
            <Card title="Contact Information" titleActions={
                <Button onClick={() => handleOpenModal()} leftIconName="fas fa-plus">
                    Add Contact
                </Button>
            }>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Title</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Details</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {contacts.map(contact => (
                                <tr key={contact.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#293c51] dark:text-gray-200">{contact.title}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#293c51] dark:text-gray-200">{contact.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{contact.details.join(', ')}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                        <div className="flex items-center justify-end space-x-1">
                                            <Button size="icon" variant="ghost" onClick={() => handleOpenModal(contact)} title="Edit">
                                                <Icon name="fas fa-pencil-alt" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteContact(contact.id)} title="Delete">
                                                <Icon name="fas fa-trash-alt" className="text-red-500" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isModalOpen && (
                <ContactModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveContact}
                    contact={editingContact}
                />
            )}
        </>
    );
};

// Define Comment type
interface Comment {
    id: string;
    text: string;
    createdBy: string;
    createDate: string;
}

// Modal for adding/editing comments
interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (commentText: string) => void;
    comment: Comment | null;
}

const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, onSave, comment }) => {
    const [text, setText] = useState('');

    useEffect(() => {
        if (isOpen) {
            setText(comment?.text || '');
        }
    }, [comment, isOpen]);

    const handleSubmit = () => {
        if (text.trim()) {
            onSave(text.trim());
        } else {
            alert('Comment cannot be empty.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={comment ? 'Edit Comment' : 'Add New Comment'}
            footer={
                <>
                    <Button onClick={handleSubmit}>Save</Button>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField
                    id="comment-text"
                    name="text"
                    label="Comment"
                    as="textarea"
                    rows={6}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                />
            </div>
        </Modal>
    );
};

const CommentsView: React.FC = () => {
    const { user: adminUser } = useAuth();
    const [comments, setComments] = useState<Comment[]>([
        { id: 'comment1', text: 'Customer interested in upgrading to CloudEdge Enterprise plan. Follow up next week.', createdBy: 'Admin User', createDate: new Date(Date.now() - 86400000).toISOString() },
        { id: 'comment2', text: 'Sent promotional material for the new AI services. Awaiting response.', createdBy: 'Admin User', createDate: new Date().toISOString() },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingComment, setEditingComment] = useState<Comment | null>(null);

    const handleOpenModal = (comment: Comment | null = null) => {
        setEditingComment(comment);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingComment(null);
    };

    const handleSaveComment = (commentText: string) => {
        if (editingComment) {
            setComments(comments.map(c => c.id === editingComment.id ? { ...c, text: commentText } : c));
        } else {
            const newComment: Comment = { id: uuidv4(), text: commentText, createdBy: adminUser?.fullName || 'Admin', createDate: new Date().toISOString() };
            setComments([newComment, ...comments]);
        }
        handleCloseModal();
    };

    const handleDeleteComment = (commentId: string) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            setComments(comments.filter(c => c.id !== commentId));
        }
    };

    return (
        <>
            <Card title="Comments & Notes" titleActions={
                <Button onClick={() => handleOpenModal()} leftIconName="fas fa-plus">
                    Add Comment
                </Button>
            }>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase w-3/5">Comment</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created By</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Create Date</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {comments.map(comment => (
                                <tr key={comment.id}>
                                    <td className="px-4 py-3 whitespace-pre-wrap text-sm text-[#293c51] dark:text-gray-200">{comment.text}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{comment.createdBy}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(comment.createDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                        <div className="flex items-center justify-end space-x-1">
                                            <Button size="icon" variant="ghost" onClick={() => handleOpenModal(comment)} title="Edit">
                                                <Icon name="fas fa-pencil-alt" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteComment(comment.id)} title="Delete">
                                                <Icon name="fas fa-trash-alt" className="text-red-500" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {comments.length === 0 && (
                        <p className="text-center py-6 text-gray-500 dark:text-gray-400">No comments yet. Add one to get started.</p>
                    )}
                </div>
            </Card>

            {isModalOpen && (
                <CommentModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveComment}
                    comment={editingComment}
                />
            )}
        </>
    );
};

// Define Document type
interface CustomerDocument {
    id: string;
    documentName: string;
    documentType: 'Contract' | 'Invoice' | 'Report' | 'JPG' | 'PNG' | 'DOC' | 'PDF' | 'Other';
    fileName: string;
    fileSize: number; // in bytes
    createdBy: string;
    creationDate: string;
}

interface DocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Pick<CustomerDocument, 'documentName' | 'documentType'> & { file: File }) => void;
    document: CustomerDocument | null;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, onSave, document }) => {
    const [formData, setFormData] = useState({
        documentName: '',
        documentType: 'Other' as CustomerDocument['documentType']
    });
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                documentName: document?.documentName || '',
                documentType: document?.documentType || 'Other',
            });
            setFile(null); // Reset file on open
        }
    }, [document, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSimpleSubmit = () => {
        if (!formData.documentName || !formData.documentType) {
            alert('Please fill all fields.');
            return;
        }
        if (!file && !document) {
             alert('Please select a file to upload.');
             return;
        }
        const finalFile = file || new File([""], document?.fileName || "placeholder.txt", { type: "text/plain" });
        onSave({ ...formData, file: finalFile });
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            title={document ? 'Edit Document' : 'Add New Document'}
            footer={
                <>
                    <Button onClick={handleSimpleSubmit}>Save</Button>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                </>
            }
        >
            <div className="space-y-4">
                <FormField id="documentName" name="documentName" label="Document Name" value={formData.documentName} onChange={handleChange} required />
                <FormField as="select" id="documentType" name="documentType" label="Document Type" value={formData.documentType} onChange={handleChange} required>
                    <option value="Contract">Contract</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Report">Report</option>
                    <option value="JPG">JPG</option>
                    <option value="PNG">PNG</option>
                    <option value="DOC">DOC</option>
                    <option value="PDF">PDF</option>
                    <option value="Other">Other</option>
                </FormField>
                <div>
                     <label className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300">
                        File {document ? '(Optional: select to replace)' : ''}
                    </label>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.doc,.docx,.pdf"
                    />
                    <Button 
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        leftIconName="fas fa-upload"
                        className="rounded-md"
                    >
                        Choose File
                    </Button>
                    {file && <p className="text-xs mt-2 text-gray-500">Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>}
                    {!file && document && <p className="text-xs mt-2 text-gray-500">Current file: {document.fileName}</p>}
                </div>
            </div>
        </Modal>
    );
};


const DocumentsView: React.FC = () => {
    const { user: adminUser } = useAuth();
    const [documents, setDocuments] = useState<CustomerDocument[]>([
        { id: 'doc1', documentName: 'Q1 2024 Performance Review', documentType: 'Report', fileName: 'q1_perf_review.pdf', fileSize: 2048000, createdBy: 'Admin User', creationDate: new Date(Date.now() - 86400000 * 10).toISOString() },
        { id: 'doc2', documentName: 'Master Service Agreement', documentType: 'Contract', fileName: 'msa_v3.docx', fileSize: 150000, createdBy: 'Admin User', creationDate: new Date(Date.now() - 86400000 * 30).toISOString() },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<CustomerDocument | null>(null);

    const handleOpenModal = (doc: CustomerDocument | null = null) => {
        setEditingDocument(doc);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDocument(null);
    };

    const handleSaveDocument = (data: Pick<CustomerDocument, 'documentName' | 'documentType'> & { file: File }) => {
        if (editingDocument) {
            setDocuments(documents.map(d => d.id === editingDocument.id ? { ...editingDocument, documentName: data.documentName, documentType: data.documentType, fileName: data.file.name, fileSize: data.file.size } : d));
        } else {
            const newDoc: CustomerDocument = { 
                id: uuidv4(),
                documentName: data.documentName,
                documentType: data.documentType,
                fileName: data.file.name,
                fileSize: data.file.size,
                createdBy: adminUser?.fullName || 'Admin',
                creationDate: new Date().toISOString()
            };
            setDocuments([newDoc, ...documents]);
        }
        handleCloseModal();
    };

    const handleDeleteDocument = (docId: string) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            setDocuments(documents.filter(d => d.id !== docId));
        }
    };
    
    return (
        <>
            <Card title="Documents" titleActions={
                <Button onClick={() => handleOpenModal()} leftIconName="fas fa-plus">
                    Add Document
                </Button>
            }>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Document Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">File Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created By</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Creation Date</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {documents.map(doc => (
                                <tr key={doc.id}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#293c51] dark:text-gray-200 font-medium">{doc.documentName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{doc.documentType}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{doc.fileName} ({ (doc.fileSize / (1024*1024) < 0.01 ? (doc.fileSize/1024).toFixed(2) + ' KB' : (doc.fileSize / (1024*1024)).toFixed(2) + ' MB')})</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{doc.createdBy}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(doc.creationDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                        <div className="flex items-center justify-end space-x-1">
                                            <Button size="icon" variant="ghost" onClick={() => handleOpenModal(doc)} title="Edit">
                                                <Icon name="fas fa-pencil-alt" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteDocument(doc.id)} title="Delete">
                                                <Icon name="fas fa-trash-alt" className="text-red-500" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {documents.length === 0 && (
                        <p className="text-center py-6 text-gray-500 dark:text-gray-400">No documents found.</p>
                    )}
                </div>
            </Card>

            {isModalOpen && (
                <DocumentModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveDocument}
                    document={editingDocument}
                />
            )}
        </>
    );
};
// END OF NEW IMPLEMENTATION

const DashboardView: React.FC<{ productPortals: (ApplicationCardData & { section: 'product' | 'application' })[], applicationPortals: (ApplicationCardData & { section: 'product' | 'application' })[] }> = ({ productPortals, applicationPortals }) => (
    <div className="space-y-8">
        {productPortals.length > 0 && (
            <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#293c51] dark:text-gray-200">Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {productPortals.map(app => <ApplicationCard key={app.id} {...app} cardSize="md:col-span-1" />)}
            </div>
            </div>
        )}

        {applicationPortals.length > 0 && (
            <div>
            <h2 className="text-2xl font-semibold mb-4 text-[#293c51] dark:text-gray-200">Applications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {applicationPortals.map(app => <ApplicationCard key={app.id} {...app} />)}
            </div>
            </div>
        )}
    </div>
);


export const DashboardPage: React.FC = () => { // This is the Customer Dashboard
  const { user: loggedInUser } = useAuth();
  const [searchParams] = useSearchParams();
  const viewAsUserId = searchParams.get('viewAsUser');
  
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (viewAsUserId) {
      const userToView = getMockUserById(viewAsUserId);
      setTargetUser(userToView || null);
    } else {
      setTargetUser(null);
    }
  }, [viewAsUserId]);
  
  let allPortals: (ApplicationCardData & { section: 'product' | 'application' })[] = [
    { 
      id: 'cloudedge', 
      name: 'CloudEdge', 
      description: 'Manage your cloud infrastructure, VMs, and network resources efficiently.', 
      iconName: "https://console.worldposta.com/assets/loginImgs/edgeLogo.png", 
      launchUrl: '/app/cloud-edge',
      section: 'product',
    },
    { 
      id: 'emailadmin', 
      name: 'Email Admin Suite', 
      description: 'Administer your email services, mailboxes, users, and domains with ease.', 
      iconName: "https://www.worldposta.com/assets/Posta-Logo.png", 
      launchUrl: 'https://tools.worldposta.com/login',
      section: 'product',
    },
     {
      id: 'kubernetes',
      name: 'Kubernetes',
      description: 'Deploy and orchestrate containerized applications at scale with our managed Kubernetes service.',
      iconName: 'fas fa-dharmachakra',
      launchUrl: '/app/kubernetes',
      section: 'product',
    },
    {
      id: 'networking',
      name: 'Networking',
      description: 'Configure load balancers, firewalls, and DNS for your cloud infrastructure.',
      iconName: 'fas fa-network-wired',
      launchUrl: '/app/networking',
      section: 'product',
    },
    {
      id: 'storage',
      name: 'Storage',
      description: 'Manage scalable object storage, block storage, and file systems for your applications.',
      iconName: 'fas fa-hdd',
      launchUrl: '/app/storage',
      section: 'product',
    },
    {
      id: 'backup',
      name: 'Backup & Disaster Recovery',
      description: 'Automate backups, protect your data, and ensure business continuity.',
      iconName: 'fas fa-save',
      launchUrl: '/app/backup',
      section: 'product',
    },
    {
        id: 'email-migration',
        name: 'Email Migration',
        description: 'Migrate your mailboxes from other providers to WorldPosta seamlessly.',
        iconName: 'fas fa-people-carry',
        launchUrl: '/app/email-migration',
        section: 'product',
    },
    { 
      id: 'billing', 
      name: 'Subscriptions', 
      description: 'Oversee your subscriptions and add new services.', 
      iconName: 'fas fa-wallet', 
      launchUrl: '/app/billing',
      section: 'application',
    },
    { 
      id: 'invoices', 
      name: 'Invoice History', 
      description: 'View and download past invoices for your records.', 
      iconName: 'fas fa-file-invoice', 
      launchUrl: '/app/invoices',
      section: 'application',
    },
    {
      id: 'user-management',
      name: 'Users Management',
      description: 'Manage team members, user groups, and their permissions.',
      iconName: 'fas fa-users-cog',
      launchUrl: '/app/team-management',
      section: 'application',
    },
    {
      id: 'support',
      name: 'Support Center',
      description: 'Access knowledge base or create support tickets with our team.',
      iconName: 'fas fa-headset',
      launchUrl: '/app/support',
      section: 'application',
    },
    {
      id: 'action-logs',
      name: 'Action Logs',
      description: 'Review a detailed history of all activities and events on your account.',
      iconName: 'fas fa-history',
      launchUrl: '/app/action-logs',
      section: 'application',
    },
     {
      id: 'monitoring',
      name: 'Monitoring & Security',
      description: 'Monitor resources, set alerts, and secure your environment with advanced tools.',
      iconName: 'fas fa-shield-alt',
      launchUrl: '/app/monitoring',
      section: 'application',
    },
  ];

  const userToDisplay = viewAsUserId ? targetUser : loggedInUser;

  if (loggedInUser?.role === 'reseller' && viewAsUserId) {
    allPortals = allPortals.filter(p => p.id !== 'billing' && p.id !== 'invoices');
  }

  if (userToDisplay?.role === 'customer') {
    const customerHiddenCardIds: string[] = [];
    allPortals = allPortals.filter(p => !customerHiddenCardIds.includes(p.id));
  }

  if (userToDisplay?.role !== 'customer') {
      allPortals = allPortals.filter(p => p.id !== 'user-management');
  }

  const productPortals = allPortals.filter(p => p.section === 'product');
  const applicationPortals = allPortals.filter(p => p.section === 'application');

  const isAdminViewAs = viewAsUserId && loggedInUser?.role === 'admin';
  
  const tabItems = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'contact', name: 'Contact' },
    { id: 'comments', name: 'Comments' },
    { id: 'documents', name: 'Documents' },
  ];
  
  return (
    <div className="space-y-6">
      {!isAdminViewAs && (
        <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">
          Welcome, <span className="text-[#679a41] dark:text-emerald-400">{userToDisplay?.displayName || userToDisplay?.fullName || 'User'}</span>!
        </h1>
      )}
      
      {isAdminViewAs ? (
        <>
          <div role="tablist" className="inline-flex space-x-1 p-1 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg">
              {tabItems.map(tab => (
                  <button
                      key={tab.id}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#679a41] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                          activeTab === tab.id
                              ? 'bg-white dark:bg-slate-800 text-[#679a41] dark:text-emerald-400 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-100'
                      }`}
                  >
                      {tab.name}
                  </button>
              ))}
          </div>
          <div>
              {activeTab === 'dashboard' && <DashboardView productPortals={productPortals} applicationPortals={applicationPortals} />}
              {activeTab === 'contact' && <ContactView />}
              {activeTab === 'comments' && <CommentsView />}
              {activeTab === 'documents' && <DocumentsView />}
          </div>
        </>
      ) : (
         <DashboardView productPortals={productPortals} applicationPortals={applicationPortals} />
      )}
    </div>
  );
};