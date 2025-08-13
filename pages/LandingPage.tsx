
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, FormField, Icon, Logo, FloatingAppLauncher } from '@/components/ui';
import { useAuth } from '@/context';
import type { User, NavItem, ApplicationCardData } from '@/types';

const getAppLauncherItems = (role: User['role'] | undefined): ApplicationCardData[] => {
    const baseApps: ApplicationCardData[] = [
        {
            id: 'website',
            name: 'WorldPosta.com',
            description: 'Visit the main WorldPosta website for news and service information.',
            iconName: 'https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%201.png',
            launchUrl: '/'
        },
        { 
            id: 'cloudedge', 
            name: 'CloudEdge', 
            description: 'Manage your cloud infrastructure, VMs, and network resources efficiently.',
            iconName: "https://console.worldposta.com/assets/loginImgs/edgeLogo.png", 
            launchUrl: '/app/cloud-edge' 
        },
        { 
            id: 'emailadmin', 
            name: 'Email Admin Suite', 
            description: 'Administer your email services, mailboxes, users, and domains with ease.',
            iconName: "https://www.worldposta.com/assets/Posta-Logo.png", 
            launchUrl: '/app/email-admin-suite'
        }
    ];

    const customerApps: ApplicationCardData[] = [
        { 
            id: 'billing', 
            name: 'Subscriptions', 
            description: 'Oversee your subscriptions and add new services.', 
            iconName: 'fas fa-wallet', 
            launchUrl: '/app/billing',
        },
        { 
            id: 'invoices', 
            name: 'Invoice History', 
            description: 'View and download past invoices for your records.', 
            iconName: 'fas fa-file-invoice', 
            launchUrl: '/app/invoices',
        },
        {
            id: 'user-management',
            name: 'Users Management',
            description: 'Manage team members, user groups, and their permissions.',
            iconName: 'fas fa-users-cog',
            launchUrl: '/app/team-management',
        },
        {
            id: 'support',
            name: 'Support Center',
            description: 'Access knowledge base or create support tickets with our team.',
            iconName: 'fas fa-headset',
            launchUrl: '/app/support',
        },
        {
            id: 'action-logs',
            name: 'Action Logs',
            description: 'Review a detailed history of all activities and events on your account.',
            iconName: 'fas fa-history',
            launchUrl: '/app/action-logs',
        },
    ];

    if (role === 'customer') {
        return [...baseApps, ...customerApps];
    }
    if (role === 'admin') {
        return [
            { id: 'customers', name: 'Customers', description: 'Search, manage, and view customer accounts.', iconName: 'fas fa-users', launchUrl: '/app/admin/users' },
            { id: 'billing', name: 'Billing Overview', description: 'Access and manage billing for all customer accounts.', iconName: 'fas fa-cash-register', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    if (role === 'reseller') {
        return [
            { id: 'customers', name: 'My Customers', description: 'Access and manage your customer accounts.', iconName: 'fas fa-user-friends', launchUrl: '/app/reseller/customers' },
            { id: 'billing', name: 'Reseller Billing', description: 'Manage your billing, commissions, and payment history.', iconName: 'fas fa-file-invoice-dollar', launchUrl: '/app/billing' },
            ...baseApps,
        ];
    }
    return baseApps;
};

const HeroSlider: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const slides = [
        {
            title: "Mission-Critical <br/> Cloud Solutions",
            description: "Experience unparalleled performance, security, and scalability with WorldPosta's enterprise-grade cloud infrastructure. Built for businesses that demand zero downtime.",
            bgImage: "https://www.milesweb.com/blog/wp-content/uploads/2024/02/what-is-cpu.png"
        },
        {
            title: "Advanced Security <br/> You Can Trust",
            description: "Protect your digital assets with our 24/7 Security Operations Center (SOC), advanced threat protection, and comprehensive compliance certifications.",
            bgImage: "https://www.milesweb.com/blog/wp-content/uploads/2024/02/what-is-gpu.png"
        },
        {
            title: "Seamless Global <br/> Collaboration",
            description: "Empower your teams with CloudSpace, our secure suite for file sharing, video conferencing, and real-time document collaboration, with 10TB storage per user.",
            bgImage: "https://www.intelligentdatacentres.com/wp-content/uploads/2024/04/HyperCool-liquid-cooling-technology.jpg"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, [slides.length]);

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 7000);
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    const handleCtaClick = () => {
        if (isAuthenticated) {
            const role = user?.role;
            if (role === 'admin') navigate('/app/admin-dashboard');
            else if (role === 'reseller') navigate('/app/reseller-dashboard');
            else navigate('/app/dashboard');
        } else {
            navigate('/signup');
        }
    };

    return (
        <section className="relative h-screen min-h-[700px] w-full overflow-hidden text-white">
            <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
                    style={{ backgroundImage: `url(${slide.bgImage})`, opacity: index === currentSlide ? 1 : 0 }}
                />
            ))}
            <div className="relative z-20 h-full flex items-center justify-center text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight leading-tight" dangerouslySetInnerHTML={{ __html: slides[currentSlide].title }}></h1>
                    <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-gray-200">{slides[currentSlide].description}</p>
                    <Button 
                        size="lg" 
                        className="bg-[#679a41] hover:bg-[#588836] dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white transform hover:scale-105 transition-transform"
                        onClick={handleCtaClick}
                    >
                        {isAuthenticated ? 'My Dashboard' : 'Register Now'}
                    </Button>
                </div>
            </div>
            <div className="absolute z-20 bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
                {slides.map((_, index) => (
                    <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'}`}></button>
                ))}
            </div>
        </section>
    );
};

const ProductBrief: React.FC = () => {
    const products = [
        { name: "CloudEdge", description: "Comprehensive, scalable cloud infrastructure with customizable VMs and resource pools.", icon: "fas fa-cloud", link: "#cloudedge" },
        { name: "CloudSpace", description: "Collaboration suite for file sharing, meetings, and enhanced team productivity.", icon: "fas fa-users", link: "#cloudspace" },
        { name: "Posta", description: "Secure, reliable, and enterprise-grade email hosting for your business.", icon: "fas fa-envelope", link: "#posta" },
        { name: "WPSYS IT Solutions", description: "Enterprise-level system integration, IT automation, and security solutions.", icon: "fas fa-shield-alt", link: "#wpsys" }
    ];
    return (
        <section className="py-20 bg-gray-50 dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map(p => (
                        <a href={p.link} key={p.name} className="block p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#679a41]/10 dark:bg-emerald-400/10 mx-auto mb-4">
                                <Icon name={p.icon} className="text-3xl text-[#679a41] dark:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-[#293c51] dark:text-gray-100">{p.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{p.description}</p>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

interface FeatureSectionProps {
    id: string;
    title: string;
    description: string;
    features: { icon: string; text: string }[];
    imageUrl: string;
    imagePosition?: 'left' | 'right';
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ id, title, description, features, imageUrl, imagePosition = 'left' }) => {
    const isImageLeft = imagePosition === 'left';
    return (
        <section id={id} className="py-20 bg-white dark:bg-slate-800">
            <div className="container mx-auto px-4">
                <div className={`flex flex-col md:flex-row gap-12 items-center ${isImageLeft ? '' : 'md:flex-row-reverse'}`}>
                    <div className="md:w-1/2">
                        <img src={imageUrl} alt={title} className="rounded-lg shadow-2xl object-cover w-full h-auto aspect-video" />
                    </div>
                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-bold mb-4 text-[#293c51] dark:text-gray-100">{title}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
                        <ul className="space-y-4">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <Icon name={feature.icon} className="text-xl text-[#679a41] dark:text-emerald-400 mt-1 mr-4 flex-shrink-0" />
                                    <span>{feature.text}</span>
                                </li>
                            ))}
                        </ul>
                        <Button className="mt-8">Learn More</Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const SecurityTicker: React.FC = () => {
    const logos = [
        "https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%201.png",
        "https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%202.png",
        "https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%203.png",
        "https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%204.png",
        "https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%205.png"
    ];
    return (
        <section className="py-20 bg-gray-50 dark:bg-slate-900">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4 text-[#293c51] dark:text-gray-100">Security</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">Managed by our advanced SOC, we ensure your compliance across all critical regulations.</p>
                <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap">
                    {logos.map((logo, i) => (
                        <img key={i} src={logo} alt={`Certification Logo ${i + 1}`} className="h-12 w-auto object-contain" />
                    ))}
                </div>
            </div>
        </section>
    );
};

const WhyChooseUs: React.FC = () => {
    const benefits = [
        { icon: 'fas fa-headset', title: '24/7 Expert Support', description: 'Our dedicated, certified experts are always ready to help you, any time of the day.' },
        { icon: 'fas fa-shield-alt', title: 'Advanced Security', description: 'XDR, DDoS protection, Palo Alto firewalls, and continuous SOC monitoring keep you safe.' },
        { icon: 'fas fa-random', title: 'Seamless Migration', description: 'We handle your entire migration process with zero downtime, ensuring a smooth transition.' },
        { icon: 'fas fa-tachometer-alt', title: 'Mission-Critical Performance', description: 'Rely on our 99.99% SLA uptime guarantee for your most important applications.' },
    ];
    return (
        <section className="py-20 bg-gray-50 dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Why Choose WorldPosta?</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map(b => (
                        <Card key={b.title} className="text-center">
                            <Icon name={b.icon} className="text-4xl text-[#679a41] dark:text-emerald-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{b.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{b.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

const CustomerBenefits: React.FC = () => {
    const benefits = [
        { icon: 'fas fa-plane-departure', title: 'Easy, Zero-Downtime Migration', description: 'Migrate without disrupting your business operations.' },
        { icon: 'fas fa-globe-americas', title: 'Global Reach with Local Expertise', description: '35 availability zones and multilingual support.' },
        { icon: 'fas fa-award', title: 'Comprehensive Compliance', description: 'ISO, PCI DSS, and SOC 2 certifications.' },
    ];
    return (
        <section className="py-20 bg-white dark:bg-slate-800">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {benefits.map(b => (
                    <div key={b.title}>
                        <Icon name={b.icon} className="text-5xl text-[#679a41] dark:text-emerald-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">{b.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{b.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

const Certifications: React.FC = () => {
    const logos = [
        "https://www.svgrepo.com/show/44310/nike.svg",
        "https://www.svgrepo.com/show/303472/adidas-logo.svg",
        "https://www.svgrepo.com/show/452131/coca-cola.svg",
        "https://www.svgrepo.com/show/303272/mcdonalds-15-logo.svg",
        "https://www.svgrepo.com/show/303268/netflix-logo.svg",
        "https://www.svgrepo.com/show/303152/amazon-logo.svg",
        "https://www.svgrepo.com/show/303268/google-logo.svg",
    ];
    return (
        <div className="py-12 bg-gray-100 dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap opacity-60">
                    {logos.map((logo, i) => (
                        <img key={i} src={logo} alt={`Client Logo ${i + 1}`} className="h-10 w-auto object-contain" />
                    ))}
                </div>
            </div>
        </div>
    );
};

const DataCenter: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const handleCtaClick = () => {
        if (isAuthenticated) {
            const role = user?.role;
            if (role === 'admin') navigate('/app/admin-dashboard');
            else if (role === 'reseller') navigate('/app/reseller-dashboard');
            else navigate('/app/dashboard');
        } else {
            navigate('/signup');
        }
    };

    return (
        <section className="py-20 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1591493732773-289591b36582?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3')"}}>
            <div className="absolute inset-0 bg-slate-900/80"></div>
            <div className="relative container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-4 text-white">Our distributed data centers allow enterprises to easily manage their IT architecture</h2>
                    <ul className="space-y-3 text-gray-200">
                        <li className="flex items-center"><Icon name="fas fa-check-circle" className="mr-3 text-emerald-400"/>Global availability</li>
                        <li className="flex items-center"><Icon name="fas fa-check-circle" className="mr-3 text-emerald-400"/>High performance and security</li>
                        <li className="flex items-center"><Icon name="fas fa-check-circle" className="mr-3 text-emerald-400"/>Scalability and customization</li>
                        <li className="flex items-center"><Icon name="fas fa-check-circle" className="mr-3 text-emerald-400"/>24/7 expert support</li>
                    </ul>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm p-8 rounded-lg">
                    <p className="text-lg text-gray-200">Contact our experts today at:</p>
                    <p className="text-3xl font-bold my-4 text-emerald-400">+1 (647) 556-6256</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="primary" size="lg" onClick={handleCtaClick}>
                            {isAuthenticated ? 'My Dashboard' : 'Register Now'}
                        </Button>
                        <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/20">Contact Us</Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const ContactForm: React.FC<{isAuthenticated: boolean}> = ({ isAuthenticated }) => {
    const [formData, setFormData] = useState({ name: '', email: '', inquiry: '', phone: '', details: '', terms: false });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
    }
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.terms) {
            alert("You must accept the terms and conditions.");
            return;
        }
        alert(`Form submitted! Thank you, ${formData.name}.`);
        console.log(formData);
    }
    return (
        <section className="py-20 bg-gray-50 dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-[#293c51] dark:text-gray-100">Ready to Experience Secure and Mission-Critical Cloud Solutions?</h2>
                        <p className="text-gray-600 dark:text-gray-400">{
                            isAuthenticated 
                            ? "We're here to help you build the perfect solution for your business needs. Schedule a free consultation with one of our experts."
                            : "Sign up today or schedule a free consultation with one of our experts. We're here to help you build the perfect solution for your business needs."
                        }</p>
                    </div>
                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <FormField id="name" name="name" label="Name" value={formData.name} onChange={handleChange} required />
                            <FormField id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
                            <FormField as="select" id="inquiry" name="inquiry" label="Inquiry" value={formData.inquiry} onChange={handleChange}>
                                <option value="">Select a service</option>
                                <option>CloudEdge Inquiry</option>
                                <option>SAP Hosting</option>
                                <option>Cybersecurity (SOC)</option>
                                <option>General IT Consultation</option>
                            </FormField>
                            <FormField id="phone" name="phone" label="Phone (Optional)" type="tel" value={formData.phone} onChange={handleChange} />
                            <FormField as="textarea" id="details" name="details" label="Additional Details (Optional)" value={formData.details} onChange={handleChange} />
                            <FormField type="checkbox" id="terms" name="terms" checked={formData.terms} onChange={handleChange} label="I accept the terms and conditions."/>
                            <Button type="submit" fullWidth disabled={!formData.terms}>Talk to Our Experts</Button>
                        </form>
                    </Card>
                </div>
            </div>
        </section>
    );
};

const ResourceLibrary: React.FC = () => {
    const articles = [
        { title: "Five Ways to Develop a World Class Sales Operations Function", link: "#" },
        { title: "Succession Risks That Threaten Your Leadership Strategy", link: "#" },
        { title: "Financial's Need For Strategic Advisor", link: "#" },
    ];
    return (
        <section className="py-20 bg-white dark:bg-slate-800">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">From Our Resource Library</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {articles.map(a => (
                        <a href={a.link} key={a.title} className="group block">
                            <Card className="h-full">
                                <img src="https://www.worldposta.com/assets/WP-Logo.png" alt="WorldPosta Logo" className="w-full h-40 object-contain p-4 rounded-t-lg bg-gray-100 dark:bg-slate-700 mb-4" />
                                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#679a41] dark:group-hover:text-emerald-400 transition-colors">{a.title}</h3>
                                <span className="text-sm font-semibold text-[#679a41] dark:text-emerald-400 group-hover:underline">Read More &rarr;</span>
                            </Card>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

const LandingFooter: React.FC = () => {
    return (
        <footer className="bg-slate-800 dark:bg-slate-900 text-gray-300 py-12">
            <div className="container mx-auto px-4 text-center">
                <Logo iconClassName="h-10 w-auto filter brightness-0 invert mx-auto mb-4" />
                <p>&copy; {new Date().getFullYear()} WorldPosta. All Rights Reserved.</p>
                <div className="mt-4 space-x-6">
                    <Link to="/login" className="hover:text-emerald-400 hover:underline">Portal Login</Link>
                    <a href="https://www.worldposta.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 hover:underline">Privacy Policy</a>
                    <a href="https://www.worldposta.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 hover:underline">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export const LandingPage: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    const [appLauncherOpen, setAppLauncherOpen] = useState(false);
    const appLauncherRef = useRef<HTMLDivElement>(null);
    const appLauncherButtonRef = useRef<HTMLButtonElement>(null);
    
    const appLauncherItems = getAppLauncherItems(user?.role);
    const userNavItems: NavItem[] = [
        { name: 'Dashboard', path: user?.role === 'admin' ? '/app/admin-dashboard' : user?.role === 'reseller' ? '/app/reseller-dashboard' : '/app/dashboard', iconName: 'fas fa-home' },
        { name: 'Settings', path: '/app/settings', iconName: 'fas fa-cog' },
    ];
    
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
                userMenuButtonRef.current && !userMenuButtonRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
            if (appLauncherRef.current && !appLauncherRef.current.contains(event.target as Node) &&
                appLauncherButtonRef.current && !appLauncherButtonRef.current.contains(event.target as Node)) {
                setAppLauncherOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const cloudEdgeFeatures = [
        { icon: "fas fa-cogs", text: "Resource Pools with dedicated CPU, Memory, and Storage." },
        { icon: "fas fa-expand-arrows-alt", text: "Customizable VMs: Up to 128 cores and 24TB Memory." },
        { icon: "fas fa-hdd", text: "High-performance NVME and SSD storage options." },
        { icon: "fas fa-brain", text: "AI-Powered Optimization for peak performance and efficiency." },
        { icon: "fas fa-network-wired", text: "Global low-latency network across 35 availability zones." },
    ];
    const sapFeatures = [
        { icon: "fab fa-suse", text: "Comprehensive SAP Hosting with hardened SUSE Linux environments." },
        { icon: "fas fa-tasks", text: "Continuous SAP Management, including monitoring, backups, and security." },
        { icon: "fas fa-user-tie", text: "Dedicated SAP Team of certified experts to support your operations." },
    ];
    const cloudSpaceFeatures = [
        { icon: "fas fa-comments", text: "Team chat and video conferencing for seamless communication." },
        { icon: "fas fa-file-alt", text: "Real-time document sharing and collaborative editing." },
        { icon: "fas fa-database", text: "Secure file storage with a generous 10 TB per user." },
        { icon: "fas fa-magic", text: "AI-powered productivity tools to streamline your workflows." },
    ];
    const postaFeatures = [
        { icon: "fas fa-hdd", text: "Massive mailboxes up to 1TB to store all your important communications." },
        { icon: "fas fa-shield-virus", text: "Zero-day attack protection to safeguard against emerging threats." },
        { icon: "fas fa-user-secret", text: "Advanced anti-phishing and end-to-end encryption for maximum security." },
        { icon: "fas fa-check-double", text: "99.99% SLA uptime guarantee for mission-critical reliability." },
    ];
    const wpsysFeatures = [
        { icon: "fas fa-broadcast-tower", text: "Security Operations Center (SOC) with 24/7 monitoring and threat response." },
        { icon: "fas fa-cloud-upload-alt", text: "Automated multi-cloud and hybrid cloud management for simplified IT." },
        { icon: "fas fa-cogs", text: "Continuous SAP operations and expert support to optimize your ERP." },
        { icon: "fas fa-fingerprint", text: "Advanced cybersecurity solutions including XDR and Managed Palo Alto Firewalls." },
    ];

    const headerTextColor = !isScrolled ? 'text-white' : 'text-gray-700 dark:text-gray-200';
    const headerButtonHover = !isScrolled ? 'hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-slate-700';

    return (
        <div className="bg-white dark:bg-slate-900">
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white dark:bg-slate-800 shadow-md' : 'bg-transparent'}`}>
                <nav className="container mx-auto flex justify-between items-center p-4">
                    <div className="flex items-center gap-x-8">
                        <Logo iconClassName={`h-8 w-auto transition-all ${!isScrolled ? 'filter brightness-0 invert' : ''}`} />
                        <div className={`hidden md:flex items-center space-x-6 text-sm font-medium ${headerTextColor}`}>
                            <Link to="/posta-pricing" className="hover:text-[#679a41] dark:hover:text-emerald-400">Posta Pricing</Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                         {isAuthenticated && user ? (
                            <>
                                <div className="relative">
                                    <button
                                        ref={appLauncherButtonRef}
                                        onClick={() => setAppLauncherOpen(o => !o)}
                                        className={`px-2 py-1 rounded-lg ${headerTextColor} ${headerButtonHover} flex flex-col items-center justify-center`}
                                        aria-haspopup="true"
                                        aria-expanded={appLauncherOpen}
                                        aria-label="Open application launcher"
                                    >
                                        <Icon name="fa-solid fa-grip" className="text-xl" />
                                        <span className="text-xs mt-0.5">Apps</span>
                                    </button>
                                    <FloatingAppLauncher
                                        isOpen={appLauncherOpen}
                                        onClose={() => setAppLauncherOpen(false)}
                                        panelRef={appLauncherRef}
                                        navItems={userNavItems}
                                        appItems={appLauncherItems}
                                    />
                                </div>
                                <div ref={userMenuRef} className="relative">
                                    <button 
                                        ref={userMenuButtonRef}
                                        onClick={() => setUserMenuOpen(o => !o)} 
                                        className={`flex items-center rounded-full p-1 ${headerTextColor} ${headerButtonHover}`}
                                    >
                                        {user.avatarUrl ? (
                                            <img className="h-8 w-8 rounded-full" src={user.avatarUrl} alt="User avatar" />
                                        ) : (
                                            <Icon name="fas fa-user-circle" className="h-8 w-8 text-3xl" />
                                        )}
                                        <span className="ml-2 hidden md:inline font-medium">{user.displayName}</span>
                                        <Icon name="fas fa-chevron-down" className={`ml-1 text-xs transform transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                                    </button>
                                    {userMenuOpen && (
                                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none text-[#293c51] dark:text-gray-200">
                                            {userNavItems.map(item => (
                                                <Link key={item.name} to={item.path} onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                                                    <Icon name={item.iconName || ''} className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> {item.name}
                                                </Link>
                                            ))}
                                             <button
                                                onClick={() => { logout(); setUserMenuOpen(false); }}
                                                className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600 text-red-600 dark:text-red-400"
                                            >
                                                <Icon name="fas fa-sign-out-alt" className="w-5 h-5 mr-2" fixedWidth /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="space-x-2">
                                <Button variant="ghost" onClick={() => navigate('/login')} className={`${headerTextColor} ${headerButtonHover}`}>Sign In</Button>
                                <Button variant="primary" onClick={() => navigate('/signup')}>Get Started</Button>
                            </div>
                        )}
                    </div>
                </nav>
            </header>
            <main>
                <HeroSlider />
                <ProductBrief />
                <FeatureSection 
                    id="cloudedge"
                    title="Scalability and Performance at Your Fingertips"
                    description="Scale your infrastructure with customizable resource pools, dedicated performance, and enterprise-level security. CloudEdge provides the foundation for your most demanding applications."
                    features={cloudEdgeFeatures}
                    imageUrl="https://www.worldposta.com/assets/Newhomeimgs/jpeg-optimizer_4.jpg1-ezgif.com-apng-to-avif-converter.avif"
                />
                 <FeatureSection 
                    id="sap"
                    title="Empowering Your SAP Environment with WorldPosta's Expertise"
                    description="Optimize your SAP operations with our robust cloud hosting, enhanced security, and expert management. We ensure your SAP landscape is stable, secure, and performing at its best."
                    features={sapFeatures}
                    imageUrl="https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2106&auto=format&fit=crop&ixlib=rb-4.0.3"
                    imagePosition='right'
                />
                <SecurityTicker />
                 <FeatureSection 
                    id="cloudspace"
                    title="Collaborate Anywhere with CloudSpace"
                    description="Enhance team productivity with secure file sharing, video conferencing, and AI-powered collaboration tools. CloudSpace is your all-in-one digital workspace."
                    features={cloudSpaceFeatures}
                    imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
                />
                <FeatureSection 
                    id="posta"
                    title="Power Your Business with Professional, Secure Email"
                    description="Unlock seamless communication with enterprise-grade email powered by cutting-edge cloud infrastructure. Posta is more than just email; it's a secure communication hub."
                    features={postaFeatures}
                    imageUrl="https://www.worldposta.com/assets/Newhomeimgs/jpeg-optimizer_jpeg-optimizer_6-ezgif.com-apng-to-avif-converter.avif"
                    imagePosition='right'
                />
                 <FeatureSection 
                    id="wpsys"
                    title="WPSYS: IT Solutions That Drive Growth"
                    description="From comprehensive IT infrastructure management to advanced cybersecurity and system integration, WPSYS provides the end-to-end solutions your business needs to thrive."
                    features={wpsysFeatures}
                    imageUrl="https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
                />
                <WhyChooseUs />
                <CustomerBenefits />
                <Certifications />
                <DataCenter />
                <ContactForm isAuthenticated={isAuthenticated} />
                <ResourceLibrary />
            </main>
            <LandingFooter />
        </div>
    );
};
