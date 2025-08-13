
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Icon, Modal, Button, FormField } from '@/components/ui';

interface NavSubItem {
  name: string;
  path: string;
}

interface NavItemWithSubItems {
  name: string;
  icon: string;
  subItems: NavSubItem[];
}

interface EmailAdminSidebarProps {
    isCollapsed: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export const EmailAdminSidebar: React.FC<EmailAdminSidebarProps> = ({ isCollapsed, isOpen, onClose }) => {
    const location = useLocation();
    const [openSections, setOpenSections] = useState<string[]>([]);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('General Feedback');
    const [comments, setComments] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const baseTextColor = "text-gray-700 dark:text-gray-300";
    const hoverBgColor = "hover:bg-gray-200 dark:hover:bg-slate-700";
    const hoverTextColor = "hover:text-[#679a41] dark:hover:text-emerald-400";
    const activeBgColor = "bg-[#679a41] dark:bg-emerald-600";
    const activeTextColor = "text-white dark:text-white";
    
    const iconBaseColor = "text-[#679a41] dark:text-emerald-400";
    const iconActiveColor = "text-white dark:text-white"; 
    const iconHoverColor = "group-hover:text-[#588836] dark:group-hover:text-emerald-500";
    
    const navItems: (NavSubItem & { icon: string } | NavItemWithSubItems)[] = [
        { name: 'Dashboard', path: '/app/email-admin-suite', icon: 'fas fa-tachometer-alt' },
        { name: 'Organizations and domains', path: '/app/email-admin-suite/orgs-and-domains', icon: 'fas fa-sitemap' },
        {
            name: 'Exchange Email',
            icon: 'fas fa-envelope',
            subItems: [
                { name: 'Mailboxes', path: '/app/email-admin-suite/exchange/mailboxes' },
                { name: 'Distribution Lists', path: '/app/email-admin-suite/exchange/distribution-lists' },
                { name: 'Shared Contacts', path: '/app/email-admin-suite/exchange/shared-contacts' },
                { name: 'Bulk Module', path: '/app/email-admin-suite/exchange/bulk-module' },
                { name: 'Running Tasks', path: '/app/email-admin-suite/exchange/running-tasks' },
                { name: 'Mailbox Plans', path: '/app/email-admin-suite/exchange/mailbox-plans' },
                { name: 'SMTP Logs', path: '/app/email-admin-suite/exchange/smtp-logs' },
                { name: 'PST Logs', path: '/app/email-admin-suite/exchange/pst-logs' },
                { name: 'Rules', path: '/app/email-admin-suite/exchange/rules' },
                { name: 'Account Statistics', path: '/app/email-admin-suite/exchange/account-statistics' },
            ]
        },
        {
            name: 'Admin & Billing',
            icon: 'fas fa-cogs',
            subItems: [
                { name: 'Billing', path: '/app/email-admin-suite/admin/billing' },
                { name: 'Users', path: '/app/email-admin-suite/admin/users' },
                { name: 'Permissions Groups', path: '/app/email-admin-suite/admin/permission-groups' },
                { name: 'Background Tasks', path: '/app/email-admin-suite/admin/background-tasks' },
                { name: 'Action Logs', path: '/app/email-admin-suite/admin/action-logs' },
                { name: 'White & Black Lists', path: '/app/email-admin-suite/admin/lists' },
                { name: 'Sister Companies', path: '/app/email-admin-suite/admin/sister-companies' },
                { name: 'White & Black IP', path: '/app/email-admin-suite/admin/ip-lists' },
            ]
        },
        { name: 'Migrations', path: '/app/email-admin-suite/migrations', icon: 'fas fa-exchange-alt' },
    ];
    
    useEffect(() => {
        const currentPath = location.pathname;
        for (const item of navItems) {
            if ('subItems' in item) {
                if (item.subItems.some(sub => currentPath.startsWith(sub.path))) {
                    if (!openSections.includes(item.name)) {
                        setOpenSections(prev => [...prev, item.name]);
                    }
                    return;
                }
            }
        }
    }, [location.pathname]);

    const toggleSection = (sectionName: string) => {
        setOpenSections(prev => 
            prev.includes(sectionName)
                ? prev.filter(name => name !== sectionName)
                : [...prev, sectionName]
        );
    };

    const handleOpenFeedback = () => {
        setIsFeedbackModalOpen(true);
        // Reset state when opening
        setRating(0);
        setHoverRating(0);
        setCategory('General Feedback');
        setComments('');
        setSubmitted(false);
        setIsLoading(false);
    };

    const handleCloseFeedback = () => setIsFeedbackModalOpen(false);

    const handleSubmitFeedback = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating.');
            return;
        }
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setSubmitted(true);
            setTimeout(() => {
                handleCloseFeedback();
            }, 3000); // Close modal after 3 seconds
        }, 1500);
    };

    const StarRating = () => (
        <div className="flex justify-center items-center my-4 space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                    aria-label={`Rate ${star} out of 5 stars`}
                >
                    <Icon
                        name={(hoverRating || rating) >= star ? 'fas fa-star' : 'far fa-star'}
                        className={`text-3xl cursor-pointer transition-colors duration-200 ${
                            (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'
                        }`}
                    />
                </button>
            ))}
        </div>
    );

    return (
        <>
        {isOpen && (
            <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" 
            onClick={onClose}
            aria-hidden="true"
            ></div>
        )}
        <aside className={`fixed top-0 left-0 z-40 h-screen bg-[#f8f8f8] dark:bg-slate-800 flex-shrink-0 flex flex-col border-r dark:border-slate-700 transition-all duration-300 ease-in-out
                       ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                       lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen 
                       ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-slate-700 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                <Link to="/app/email-admin-suite" className="flex items-center gap-2">
                    <img src="https://www.worldposta.com/assets/Posta-Logo.png" alt="Posta Logo" className="h-7 w-auto" />
                    {!isCollapsed && <span className="font-semibold text-gray-500 text-sm">Suite</span>}
                </Link>
                <button onClick={onClose} className={`lg:hidden ${baseTextColor} ${hoverTextColor}`}>
                    <Icon name="fas fa-times" className="text-xl" />
                </button>
            </div>
            <nav className="flex-grow py-4 px-2 overflow-y-auto">
                <ul className="space-y-1">
                    {navItems.map(item => (
                        <li key={item.name}>
                            {'subItems' in item ? (
                                <>
                                    <button onClick={() => toggleSection(item.name)} title={isCollapsed ? item.name : undefined} 
                                        className={`w-full flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${isCollapsed ? 'px-3 justify-center' : 'px-3 justify-between'} ${openSections.includes(item.name) ? `${activeBgColor} ${activeTextColor}` : `${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}`}
                                    >
                                        <div className={`flex items-center`}>
                                            <Icon name={item.icon} fixedWidth className={`text-lg ${isCollapsed ? '' : 'mr-3'} ${openSections.includes(item.name) ? iconActiveColor : `${iconBaseColor} ${iconHoverColor}`}`} />
                                            {!isCollapsed && <span>{item.name}</span>}
                                        </div>
                                        {!isCollapsed && <Icon name={openSections.includes(item.name) ? 'fas fa-chevron-down' : 'fas fa-chevron-right'} className="w-3 transition-transform" />}
                                    </button>
                                    {!isCollapsed && openSections.includes(item.name) && (
                                        <ul className="pt-1 space-y-1">
                                            {item.subItems.map(subItem => (
                                                <li key={subItem.name}>
                                                    <NavLink to={subItem.path} 
                                                        className={({isActive}) => `block py-2.5 pr-3 pl-11 text-sm rounded-md ${isActive ? `${activeBgColor} ${activeTextColor}` : `text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 ${hoverTextColor}`}`}
                                                    >
                                                        {subItem.name}
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            ) : (
                                <NavLink to={item.path} end title={isCollapsed ? item.name : undefined} 
                                    className={({isActive}) => `flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group ${isCollapsed ? 'px-3 justify-center' : 'px-3'} ${isActive ? `${activeBgColor} ${activeTextColor} shadow-inner` : `${baseTextColor} ${hoverBgColor} ${hoverTextColor}`}`}
                                >
                                     {({isActive}) => (
                                        <>
                                            <Icon name={item.icon} fixedWidth className={`text-lg ${isCollapsed ? '' : 'mr-3'} ${isActive ? iconActiveColor : `${iconBaseColor} ${iconHoverColor}`}`} />
                                            {!isCollapsed && <span>{item.name}</span>}
                                        </>
                                     )}
                                </NavLink>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="px-2 pb-2 pt-0 mt-auto">
                <hr className={`my-2 border-gray-300 dark:border-slate-600 ${isCollapsed ? 'mx-auto w-10/12' : ''}`} />
                <button
                    title={isCollapsed ? "Feedback" : undefined}
                    className={`w-full flex items-center py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out group mb-1 ${baseTextColor} ${hoverBgColor} ${hoverTextColor} ${isCollapsed ? 'px-3 justify-center' : 'px-3'}`}
                    onClick={handleOpenFeedback}
                >
                    <Icon name="fas fa-bullhorn" fixedWidth className={`text-lg ${iconBaseColor} ${iconHoverColor} ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && <span>Feedback</span>}
                </button>
            </div>
        </aside>

        <Modal isOpen={isFeedbackModalOpen} onClose={handleCloseFeedback} title={submitted ? "Thank You!" : "Share Your Feedback"} size="lg">
            {submitted ? (
                <div className="text-center py-8">
                    <Icon name="fas fa-check-circle" className="text-5xl text-green-500 mb-4" />
                    <p className="text-lg text-gray-700 dark:text-gray-200">Your feedback has been submitted successfully.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">We appreciate you taking the time to help us improve.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmitFeedback}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-center text-[#293c51] dark:text-gray-300 mb-2">How was your experience?</label>
                            <StarRating />
                        </div>
                        <FormField
                            id="feedback-category"
                            name="category"
                            label="Feedback Category"
                            as="select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option>General Feedback</option>
                            <option>Bug Report</option>
                            <option>Feature Request</option>
                            <option>UI/UX Suggestion</option>
                        </FormField>
                        <FormField
                            id="feedback-comments"
                            name="comments"
                            label="Comments"
                            as="textarea"
                            rows={5}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Tell us more about your experience or suggestions..."
                        />
                    </div>
                    <div className="mt-6 flex justify-end space-x-2">
                        <Button type="button" variant="ghost" onClick={handleCloseFeedback}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading} disabled={rating === 0 || isLoading}>Submit Feedback</Button>
                    </div>
                </form>
            )}
        </Modal>
        </>
    );
};
