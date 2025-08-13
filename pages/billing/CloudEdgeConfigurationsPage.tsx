
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button, Card, FormField, Modal, CollapsibleSection, SliderInput, Icon, Stepper } from '@/components/ui';
import type { CloudEdgeConfiguration, InstanceTemplate, GPUType, CloudEdgeComponentType, MachineType, ProvisioningModel, SubscriptionTermUnit } from '@/types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for configurations

// Mock Data (Ideally this would come from an API or config files)
const mockRegions = [
  { id: 'us-east-1', name: 'US East (N. Virginia)' },
  { id: 'us-west-2', name: 'US West (Oregon)' },
  { id: 'eu-central-1', name: 'EU (Frankfurt)' },
];

const mockInstanceTemplates: InstanceTemplate[] = [
  { id: 'ce-s1', name: 'WP Instance Small (CE-S1)', cpu: 2, ramGB: 4, bootDiskGB: 50, priceMonthly: 20, description: '2 vCPU / 4 GB RAM / 50 GB Boot Disk' },
  { id: 'ce-m1', name: 'WP Instance Medium (CE-M1)', cpu: 4, ramGB: 8, bootDiskGB: 100, priceMonthly: 40, description: '4 vCPU / 8 GB RAM / 100 GB Boot Disk' },
  { id: 'ce-l1', name: 'WP Instance Large (CE-L1)', cpu: 8, ramGB: 16, bootDiskGB: 200, priceMonthly: 80, description: '8 vCPU / 16 GB RAM / 200 GB Boot Disk' },
];

const mockGPUTypes: GPUType[] = [
  { id: 'gpu-h100s', name: 'GPU Shared H100', priceMonthly: 150 },
  { id: 'gpu-h100d', name: 'GPU Dedicated H100', priceMonthly: 400 },
];

const mockOSSoftware = [
    {id: 'ubuntu-22', name: 'Ubuntu 22.04 LTS'},
    {id: 'centos-9', name: 'CentOS Stream 9'},
    {id: 'windows-2022-std', name: 'Windows Server 2022 Standard'},
    {id: 'rocky-9', name: 'Rocky Linux 9'},
];

interface ReadyPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  specs: {
      cpu: number;
      ramGB: number;
      storageGB: number;
      storageType: string;
  }
}

const mockReadyPlans: ReadyPlan[] = [
    { id: 'rp-dev', name: 'Developer Sandbox', description: 'A small, cost-effective environment for testing and development.', priceMonthly: 15, specs: { cpu: 1, ramGB: 2, storageGB: 40, storageType: 'Balanced SSD' } },
    { id: 'rp-web', name: 'General Web Server', description: 'A balanced configuration suitable for hosting most websites and web applications.', priceMonthly: 50, specs: { cpu: 4, ramGB: 8, storageGB: 100, storageType: 'Balanced SSD' } },
    { id: 'rp-db', name: 'Database Server', description: 'High memory and performance storage for demanding database workloads.', priceMonthly: 120, specs: { cpu: 4, ramGB: 32, storageGB: 200, storageType: 'Performance SSD' } },
];


// Pricing constants (per unit per month for base calculation)
const PRICE_CPU_CORE_MONTHLY = 10;
const PRICE_RAM_GB_MONTHLY = 5;
const PRICE_FLASH_GB_MONTHLY = 0.10;
const PRICE_STATIC_IP_MONTHLY = 4;
const PRICE_OBJECT_STORAGE_GB_MONTHLY = 0.02;
const PRICE_ADVANCED_BACKUP_GB_MONTHLY = 0.05; // Assuming per GB of protected data
const PRICE_TREND_MICRO_ENDPOINT_MONTHLY = 5;
const PRICE_WINDOWS_LICENSE_MONTHLY = 20;
const PRICE_LINUX_LICENSE_MONTHLY = 10; // For RHEL/SLES, etc.
const PRICE_CORTEX_XDR_ENDPOINT_MONTHLY = 8;
const PRICE_LOAD_BALANCER_INSTANCE_MONTHLY = 18;
const PRICE_ADVANCED_FIREWALL_MONTHLY = 25;
const PRICE_ENHANCED_MONITORING_MONTHLY = 10;


const calculateCloudEdgeSubtotal = (config: Partial<CloudEdgeConfiguration>): number => {
    let subtotal = 0;

    if (config.type === 'instance' && config.instanceTemplateId && config.quantity) {
        const template = mockInstanceTemplates.find(t => t.id === config.instanceTemplateId);
        if (template) subtotal += template.priceMonthly * config.quantity;
    } else if (config.type === 'vdc' && config.quantity) {
        if (config.vdcCPU) subtotal += config.vdcCPU * PRICE_CPU_CORE_MONTHLY * config.quantity;
        if (config.vdcRAM) subtotal += config.vdcRAM * PRICE_RAM_GB_MONTHLY * config.quantity;
        if (config.vdcFlashStorage) subtotal += config.vdcFlashStorage * PRICE_FLASH_GB_MONTHLY * config.quantity;
    }

    if (config.addGPUs && config.gpuType && config.gpuCount) {
        const gpu = mockGPUTypes.find(g => g.id === config.gpuType);
        if (gpu) subtotal += gpu.priceMonthly * config.gpuCount * (config.quantity || 1);
    }
    
    // Other resources (assuming quantity applies if not VDC specific)
    const qtyMultiplier = config.type === 'instance' ? (config.quantity || 1) : 1; // For VDC, these are total, for instance per instance
    if(config.staticPublicIPs) subtotal += config.staticPublicIPs * PRICE_STATIC_IP_MONTHLY * (config.type === 'vdc' ? 1 : qtyMultiplier);
    if(config.objectStorageGB) subtotal += config.objectStorageGB * PRICE_OBJECT_STORAGE_GB_MONTHLY; // Usually total, not per instance
    if(config.advancedBackupGB) subtotal += config.advancedBackupGB * PRICE_ADVANCED_BACKUP_GB_MONTHLY; // Usually total
    if(config.trendMicroEndpoints) subtotal += config.trendMicroEndpoints * PRICE_TREND_MICRO_ENDPOINT_MONTHLY * qtyMultiplier;
    if(config.windowsServerLicenses) subtotal += config.windowsServerLicenses * PRICE_WINDOWS_LICENSE_MONTHLY * qtyMultiplier;
    if(config.linuxEnterpriseLicenses) subtotal += config.linuxEnterpriseLicenses * PRICE_LINUX_LICENSE_MONTHLY * qtyMultiplier;
    if(config.cortexXDREndpoints) subtotal += config.cortexXDREndpoints * PRICE_CORTEX_XDR_ENDPOINT_MONTHLY * qtyMultiplier;
    if(config.loadBalancerInstances) subtotal += config.loadBalancerInstances * PRICE_LOAD_BALANCER_INSTANCE_MONTHLY; // Usually total

    // Add-ons
    if (config.advancedFirewall) subtotal += PRICE_ADVANCED_FIREWALL_MONTHLY * (config.type === 'vdc' ? 1 : qtyMultiplier) ;
    if (config.enhancedMonitoring) subtotal += PRICE_ENHANCED_MONITORING_MONTHLY * (config.type === 'vdc' ? 1 : qtyMultiplier);

    // Spot/Preemptible Discount (conceptual 70%)
    if (config.provisioningModel === 'spot') {
        subtotal *= 0.30;
    }

    return subtotal;
};


interface AddCloudEdgeConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddConfiguration: (config: CloudEdgeConfiguration) => void;
  editingConfig?: CloudEdgeConfiguration | null;
}

const ReadyPlanCard: React.FC<{ plan: ReadyPlan, isSelected: boolean, onSelect: () => void }> = ({ plan, isSelected, onSelect }) => (
    <button onClick={onSelect} className={`text-left border-2 rounded-lg p-4 transition-all h-full flex flex-col ${isSelected ? 'border-[#679a41] ring-2 ring-[#679a41]/50 bg-green-50 dark:bg-emerald-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
        <h4 className="font-bold text-[#293c51] dark:text-gray-100">{plan.name}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 flex-grow">{plan.description}</p>
        <div className="mt-2 pt-2 border-t border-dashed dark:border-gray-700">
            <p className="text-sm font-semibold text-[#679a41] dark:text-emerald-400">${plan.priceMonthly.toFixed(2)}<span className="text-xs font-normal text-gray-500 dark:text-gray-400">/mo</span></p>
        </div>
    </button>
);

const RadioCard = ({ id, name, value, checked, onChange, label, iconName, tooltipText, showTooltip = true }: { id: string, name: string, value: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string, iconName: string, tooltipText: string, showTooltip?: boolean}) => (
    <div className="h-full">
        <label htmlFor={id} className={`relative block p-4 border-2 rounded-lg cursor-pointer transition-all h-full flex items-center justify-center text-center ${checked ? 'border-[#679a41] ring-2 ring-[#679a41]/50 bg-green-50 dark:bg-emerald-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
            <input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
            
            <div className="flex items-center justify-center gap-2">
                <Icon name={iconName} className="text-2xl text-[#679a41] dark:text-emerald-400" />
                <span className="font-semibold text-sm text-[#293c51] dark:text-gray-200">{label}</span>
                {showTooltip && (
                     <div className="group relative flex items-center">
                        <Icon name="fas fa-info-circle" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 dark:bg-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                            {tooltipText}
                        </div>
                    </div>
                )}
            </div>
        </label>
    </div>
);

const AddCloudEdgeConfigurationModal: React.FC<AddCloudEdgeConfigurationModalProps> = ({ isOpen, onClose, onAddConfiguration, editingConfig }) => {
    const [config, setConfig] = useState<Partial<CloudEdgeConfiguration>>({
        type: 'instance',
        quantity: 1,
        subscriptionTermValue: 1,
        subscriptionTermUnit: 'month',
        deploymentRegion: mockRegions[0].id,
        provisioningModel: 'regular',
        machineType: 'performance-01',
    });
    const [currentSubtotal, setCurrentSubtotal] = useState(0);
    const [modalStep, setModalStep] = useState(1);
    const [individualNames, setIndividualNames] = useState<string[]>([]);

    useEffect(() => {
        setModalStep(1); // Reset to step 1 whenever modal opens or config being edited changes
        if(editingConfig) {
            setConfig(editingConfig);
        } else {
             setConfig({ // Reset to default when not editing
                type: 'instance',
                quantity: 1,
                subscriptionTermValue: 1,
                subscriptionTermUnit: 'month',
                deploymentRegion: mockRegions[0].id,
                provisioningModel: 'regular',
                machineType: 'performance-01',
            });
        }
    }, [editingConfig, isOpen]); // Reset/Repopulate when modal opens or editingConfig changes

    useEffect(() => {
        let subtotal = 0;
        if (config.type === 'ready-plan') {
            const plan = mockReadyPlans.find(p => p.id === config.readyPlanId);
            if (plan) {
                subtotal = plan.priceMonthly;
            }
        } else {
             // For instance/VDC, calculate based on all options, but with quantity 1 for unit price
            subtotal = calculateCloudEdgeSubtotal({ ...config, quantity: 1 });
        }
        
        setCurrentSubtotal(subtotal);
    }, [config]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        const newConfig = { ...config };
        (newConfig as any)[name] = type === 'checkbox' ? checked : (e.target as HTMLInputElement).type === 'number' ? parseFloat(value) || 0 : value;

        // if type changes, reset type-specific fields
        if(name === 'type') {
            newConfig.instanceTemplateId = undefined;
            newConfig.vdcCPU = undefined;
            newConfig.vdcRAM = undefined;
            newConfig.vdcFlashStorage = undefined;
            newConfig.readyPlanId = undefined;
        }

        setConfig(newConfig);
    };

    const handleReadyPlanSelect = (plan: ReadyPlan) => {
        setConfig(prev => ({
            ...prev,
            instanceTemplateId: undefined, 
            vdcCPU: undefined,
            readyPlanId: plan.id,
            name: prev.name || plan.name,
        }));
    };
    
    const handleSliderChange = (name: keyof CloudEdgeConfiguration, value: number) => {
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!config.name || !config.type || !config.deploymentRegion || (config.quantity || 0) < 1 || (config.subscriptionTermValue || 0) < 1) {
            alert("Please fill all required fields: Name, Type, Region, Subscription Term, and Quantity.");
            return;
        }
        if (config.type === 'ready-plan' && !config.readyPlanId) {
            alert("Please select a Ready Plan.");
            return;
        }

        const quantity = config.quantity || 1;

        if (quantity > 1 && !editingConfig) {
            setIndividualNames(
                Array.from({ length: quantity }, (_, i) => `${config.name || 'Config'}-${i + 1}`)
            );
            setModalStep(2);
        } else {
            const finalConfig: CloudEdgeConfiguration = {
                id: editingConfig?.id || uuidv4(),
                ...config,
                name: config.name || 'Unnamed Config',
                type: config.type || 'instance',
                deploymentRegion: config.deploymentRegion || mockRegions[0].id,
                subscriptionTermValue: config.subscriptionTermValue || 1,
                subscriptionTermUnit: config.subscriptionTermUnit || 'month',
                quantity: config.quantity || 1,
                unitSubtotalMonthly: currentSubtotal * (config.quantity || 1), // Total for the single line item
            };
            onAddConfiguration(finalConfig);
            onClose();
        }
    };
    
    const handleIndividualNameChange = (index: number, newName: string) => {
        setIndividualNames(prev => {
            const updated = [...prev];
            updated[index] = newName;
            return updated;
        });
    };

    const handleFinalSubmit = () => {
        const hasEmptyName = individualNames.some(name => name.trim() === '');
        if (hasEmptyName) {
            alert("Configuration names cannot be empty.");
            return;
        }
        
        individualNames.forEach(name => {
            const newConfig: CloudEdgeConfiguration = {
                id: uuidv4(),
                ...(config as CloudEdgeConfiguration), // cast to full type
                name: name,
                quantity: 1, // Each is an individual item
                unitSubtotalMonthly: currentSubtotal, // This is the price for one unit
            };
            onAddConfiguration(newConfig);
        });
        
        onClose();
    };

    const selectedTemplate = useMemo(() => {
        if (config.type === 'instance' && config.instanceTemplateId) {
            return mockInstanceTemplates.find(t => t.id === config.instanceTemplateId);
        }
        return null;
    }, [config.type, config.instanceTemplateId]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="4xl" footer={null}>
      {modalStep === 1 && (
          <>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 -mt-4">
                <h3 className="text-xl font-semibold text-center mb-4 text-[#293c51] dark:text-gray-100">
                    {editingConfig ? "Edit CloudEdge Configuration" : "Add New CloudEdge Configuration"}
                </h3>
                
                <fieldset>
                    <legend className="block text-sm font-medium mb-2 text-[#293c51] dark:text-gray-300">Configuration Type</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <RadioCard 
                            id="type-instance" name="type" value="instance" checked={config.type === 'instance'} onChange={handleChange} 
                            label="Instances" iconName="fas fa-server" tooltipText="Deploy one or more pre-defined virtual machine instances." />
                        <RadioCard 
                            id="type-vdc" name="type" value="vdc" checked={config.type === 'vdc'} onChange={handleChange} 
                            label="VDC" iconName="fas fa-cloud" tooltipText="Create a Virtual Data Center with a custom pool of resources (CPU, RAM, Storage)." />
                        <RadioCard 
                            id="type-ready-plan" name="type" value="ready-plan" checked={config.type === 'ready-plan'} onChange={handleChange} 
                            label="Ready Plans" iconName="fas fa-bolt" tooltipText="" showTooltip={false} />
                    </div>
                </fieldset>
                <div className="text-center mt-2 text-sm">
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Helpful information about the differences between Instances, VDCs, and Ready Plans would be displayed here.'); }} className="text-[#679a41] dark:text-emerald-400 hover:underline">
                        Click here to know the difference between types
                    </a>
                </div>

                <FormField id="configName" name="name" label="Configuration Name" value={config.name || ''} onChange={handleChange} placeholder="e.g., My Web Server Cluster" required />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField id="subscriptionTermValue" name="subscriptionTermValue" label="Subscription Term" type="number" value={config.subscriptionTermValue || 1} onChange={handleChange} min={1} required />
                    <FormField id="subscriptionTermUnit" name="subscriptionTermUnit" label="Duration" as="select" value={config.subscriptionTermUnit || 'month'} onChange={handleChange}>
                        <option value="hr">Hour(s)</option>
                        <option value="week">Week(s)</option>
                        <option value="month">Month(s)</option>
                        <option value="year">Year(s)</option>
                    </FormField>
                    <FormField id="quantity" name="quantity" label="Quantity" type="number" value={config.quantity || 1} onChange={handleChange} min={1} required disabled={!!editingConfig} />
                </div>
                
                <div className={`grid grid-cols-1 ${config.type === 'instance' ? 'md:grid-cols-2' : ''} gap-4`}>
                    <FormField id="deploymentRegion" name="deploymentRegion" label="Deployment Region" as="select" value={config.deploymentRegion || ''} onChange={handleChange} required>
                        {mockRegions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </FormField>
                    {config.type === 'instance' && (
                        <FormField id="machineType" name="machineType" label="Machine Type" as="select" value={config.machineType || 'performance-01'} onChange={handleChange}>
                            <option value="performance-01">Performance 01</option>
                            <option value="performance-02">Performance 02</option>
                            <option value="performance-03">Performance 03</option>
                        </FormField>
                    )}
                </div>

                {config.type === 'instance' && (
                <>
                    <FormField id="instanceTemplateId" name="instanceTemplateId" label="Instance Template" as="select" value={config.instanceTemplateId || ''} onChange={handleChange} required={config.type === 'instance'}>
                    <option value="">Select a template...</option>
                    {mockInstanceTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </FormField>
                    {selectedTemplate && <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Template provides: {selectedTemplate.description}</p>}
                </>
                )}
                
                {config.type === 'vdc' && (
                <CollapsibleSection title="Core Compute Resources (VDC)" initialOpen={true}>
                    <SliderInput id="vdcCPU" label="CPU Cores" value={config.vdcCPU || 2} onChange={(v) => handleSliderChange('vdcCPU',v)} min={2} max={64} step={1} unit="Cores" pricePerUnit={PRICE_CPU_CORE_MONTHLY}/>
                    <SliderInput id="vdcRAM" label="RAM" value={config.vdcRAM || 4} onChange={(v) => handleSliderChange('vdcRAM',v)} min={4} max={256} step={1} unit="GB" pricePerUnit={PRICE_RAM_GB_MONTHLY}/>
                    <SliderInput id="vdcFlashStorage" label="Flash Disk Storage" value={config.vdcFlashStorage || 50} onChange={(v) => handleSliderChange('vdcFlashStorage',v)} min={50} max={10000} step={10} unit="GB" pricePerUnit={PRICE_FLASH_GB_MONTHLY}/>
                </CollapsibleSection>
                )}

                {config.type === 'ready-plan' && (
                     <div className="mt-4">
                        <h4 className="font-medium mb-2 text-[#293c51] dark:text-gray-200">Select a Ready Plan</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {mockReadyPlans.map(plan => (
                                <ReadyPlanCard 
                                    key={plan.id}
                                    plan={plan}
                                    isSelected={config.readyPlanId === plan.id}
                                    onSelect={() => handleReadyPlanSelect(plan)}
                                />
                            ))}
                        </div>
                    </div>
                )}
                
                {config.type !== 'ready-plan' && (
                    <>
                        <CollapsibleSection title="Advanced Settings & Optional Resources" initialOpen={false}>
                            <FormField id="osSoftware" name="osSoftware" label="Operating System / Software" as="select" value={config.osSoftware || ''} onChange={handleChange}>
                                <option value="">Default (based on template or VDC policy)</option>
                                {mockOSSoftware.map(os => <option key={os.id} value={os.id}>{os.name}</option>)}
                            </FormField>
                            <FormField id="provisioningModel" name="provisioningModel" label="Provisioning Model" as="select" value={config.provisioningModel || 'regular'} onChange={handleChange}>
                                <option value="regular">Regular (On-demand)</option>
                                <option value="spot">Spot/Preemptible (Up to 70% Disc.)</option>
                            </FormField>
                            <FormField type="checkbox" id="confidentialVM" name="confidentialVM" label="Enable Confidential VM Service" checked={!!config.confidentialVM} onChange={handleChange} hint="Note: Compatibility and pricing vary."/>
                            <FormField type="checkbox" id="addGPUs" name="addGPUs" label="Add GPUs" checked={!!config.addGPUs} onChange={handleChange} />
                            {config.addGPUs && (
                                <div className="pl-4 border-l-2 dark:border-slate-600">
                                    <FormField id="gpuType" name="gpuType" label="GPU Type" as="select" value={config.gpuType || ''} onChange={handleChange}>
                                        <option value="">Select GPU Type...</option>
                                        {mockGPUTypes.map(gpu => <option key={gpu.id} value={gpu.id}>{gpu.name} (+${gpu.priceMonthly}/mo)</option>)}
                                    </FormField>
                                    <FormField id="gpuCount" name="gpuCount" label="GPU Count" type="number" value={config.gpuCount || 1} onChange={handleChange} min={1} />
                                </div>
                            )}
                        </CollapsibleSection>
                        
                        <CollapsibleSection title="Other Configurable Resources" initialOpen={false}>
                            <SliderInput id="staticPublicIPs" label="Static Public IPs" value={config.staticPublicIPs || 0} onChange={(v) => handleSliderChange('staticPublicIPs',v)} min={0} max={10} step={1} pricePerUnit={PRICE_STATIC_IP_MONTHLY} unit="IPs"/>
                            <SliderInput id="objectStorageGB" label="Object Storage" value={config.objectStorageGB || 0} onChange={(v) => handleSliderChange('objectStorageGB',v)} min={0} max={10000} step={100} pricePerUnit={PRICE_OBJECT_STORAGE_GB_MONTHLY} unit="GB"/>
                            <SliderInput id="advancedBackupGB" label="Advanced Backup by Veeam (Protected)" value={config.advancedBackupGB || 0} onChange={(v) => handleSliderChange('advancedBackupGB',v)} min={0} max={10000} step={100} pricePerUnit={PRICE_ADVANCED_BACKUP_GB_MONTHLY} unit="GB"/>
                            <SliderInput id="trendMicroEndpoints" label="Trend Micro Deep Security" value={config.trendMicroEndpoints || 0} onChange={(v) => handleSliderChange('trendMicroEndpoints',v)} min={0} max={100} step={1} pricePerUnit={PRICE_TREND_MICRO_ENDPOINT_MONTHLY} unit="Endpoints"/>
                            <SliderInput id="windowsServerLicenses" label="Windows Server Licenses (Add-on)" value={config.windowsServerLicenses || 0} onChange={(v) => handleSliderChange('windowsServerLicenses',v)} min={0} max={100} step={1} pricePerUnit={PRICE_WINDOWS_LICENSE_MONTHLY} unit="Licenses"/>
                            <SliderInput id="linuxEnterpriseLicenses" label="Linux Enterprise Licenses (Add-on)" value={config.linuxEnterpriseLicenses || 0} onChange={(v) => handleSliderChange('linuxEnterpriseLicenses',v)} min={0} max={100} step={1} pricePerUnit={PRICE_LINUX_LICENSE_MONTHLY} unit="Licenses"/>
                            <SliderInput id="cortexXDREndpoints" label="Cortex XDR Endpoint Protection" value={config.cortexXDREndpoints || 0} onChange={(v) => handleSliderChange('cortexXDREndpoints',v)} min={0} max={100} step={1} pricePerUnit={PRICE_CORTEX_XDR_ENDPOINT_MONTHLY} unit="Endpoints"/>
                            <SliderInput id="loadBalancerInstances" label="Load Balancer Instances" value={config.loadBalancerInstances || 0} onChange={(v) => handleSliderChange('loadBalancerInstances',v)} min={0} max={5} step={1} pricePerUnit={PRICE_LOAD_BALANCER_INSTANCE_MONTHLY} unit="Instances"/>
                        </CollapsibleSection>

                        <CollapsibleSection title="Add-ons (Monthly)" initialOpen={false}>
                            <FormField type="checkbox" id="advancedFirewall" name="advancedFirewall" label={`Advanced Firewall Service (+$${PRICE_ADVANCED_FIREWALL_MONTHLY.toFixed(2)})`} checked={!!config.advancedFirewall} onChange={handleChange}/>
                            <FormField type="checkbox" id="enhancedMonitoring" name="enhancedMonitoring" label={`Enhanced Monitoring Suite (+$${PRICE_ENHANCED_MONITORING_MONTHLY.toFixed(2)})`} checked={!!config.enhancedMonitoring} onChange={handleChange}/>
                        </CollapsibleSection>
                    </>
                )}


                <div className="mt-6 pt-4 border-t dark:border-gray-700">
                    <p className="text-lg font-semibold text-right text-[#293c51] dark:text-gray-100">
                        Unit Subtotal (Monthly Estimate): ${currentSubtotal.toFixed(2)}
                    </p>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-4 -mx-6 -mb-6 rounded-b-lg">
                <Button onClick={handleSubmit} className="w-full sm:ml-3 sm:w-auto">
                    {editingConfig ? "Update Estimate" : "Add to Estimate"}
                </Button>
                <Button variant="outline" onClick={onClose} className="mt-3 w-full sm:mt-0 sm:w-auto">Cancel</Button>
            </div>
          </>
      )}
      {modalStep === 2 && (
          <>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <h3 className="text-lg font-medium text-[#293c51] dark:text-gray-100">Name Your {config.quantity} Configurations</h3>
                <p className="text-sm text-gray-500">The base name is "{config.name}". You can customize each one below.</p>
                <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-2 border-t border-b py-4 dark:border-gray-600">
                    {individualNames.map((name, index) => (
                        <FormField
                            key={index}
                            id={`config-name-${index}`}
                            label={`Configuration #${index + 1} Name`}
                            value={name}
                            onChange={e => handleIndividualNameChange(index, e.target.value)}
                            required
                        />
                    ))}
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-4 -mx-6 -mb-6 rounded-b-lg">
                <Button onClick={handleFinalSubmit} className="w-full sm:ml-3 sm:w-auto">Add {config.quantity} Configurations</Button>
                <Button variant="outline" onClick={() => setModalStep(1)} className="mt-3 w-full sm:mt-0 sm:w-auto">Back</Button>
            </div>
          </>
      )}
    </Modal>
  );
};


interface ConfigurationItemCardProps {
  config: CloudEdgeConfiguration;
  onEdit: (configId: string) => void;
  onRemove: (configId: string) => void;
}

const ConfigurationItemCard: React.FC<ConfigurationItemCardProps> = ({ config, onEdit, onRemove }) => {
  return (
    <Card className="mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-[#293c51] dark:text-gray-100">{config.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Type: {config.type} | Qty: {config.quantity} | Term: {`${config.subscriptionTermValue} ${config.subscriptionTermUnit}${config.subscriptionTermValue > 1 ? 's' : ''}`}</p>
          {config.type === 'instance' && config.instanceTemplateId && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Template: {mockInstanceTemplates.find(t=>t.id === config.instanceTemplateId)?.name}</p>
          )}
        </div>
        <div className="flex space-x-2">
            <Button size="icon" variant="ghost" onClick={() => onEdit(config.id)} title="Edit">
                 <Icon name="fas fa-pencil-alt" aria-label="Edit configuration" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onRemove(config.id)} title="Remove">
                <Icon name="fas fa-trash-alt" className="text-red-500 dark:text-red-400" aria-label="Remove configuration"/>
            </Button>
        </div>
      </div>
      <p className="text-right mt-2 font-semibold text-lg text-[#679a41] dark:text-emerald-400">${config.unitSubtotalMonthly.toFixed(2)} <span className="text-xs text-gray-500 dark:text-gray-400">/mo</span></p>
    </Card>
  );
};

const EstimateSummaryCard: React.FC<{ configurations: CloudEdgeConfiguration[] }> = ({ configurations }) => {
  const totalMonthlyEstimate = useMemo(() => {
    return configurations.reduce((sum, config) => sum + config.unitSubtotalMonthly, 0);
  }, [configurations]);

  if (configurations.length === 0) {
    return (
      <Card title="Estimate Summary">
        <p className="text-gray-500 dark:text-gray-400">No configurations added to estimate.</p>
      </Card>
    );
  }

  return (
    <Card title="Estimate Summary" className="sticky top-20">
      {configurations.map(config => (
        <div key={config.id} className="py-2 border-b dark:border-gray-700 last:border-b-0">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#293c51] dark:text-gray-200">{config.name} (x{config.quantity})</span>
            <span className="text-sm font-medium text-[#293c51] dark:text-gray-100">${config.unitSubtotalMonthly.toFixed(2)}</span>
          </div>
        </div>
      ))}
      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <div className="flex justify-between font-bold text-xl text-[#293c51] dark:text-gray-100">
          <span>Total Monthly Estimate:</span>
          <span>${totalMonthlyEstimate.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
};


const PaymentStep: React.FC<{
    configurations: CloudEdgeConfiguration[], 
    totalAmount: number, 
    onBack: () => void, 
    onPay: () => void
}> = ({ configurations, totalAmount, onBack, onPay }) => {
    const [isPaying, setIsPaying] = useState(false);

    const handlePaymentRedirect = () => {
        setIsPaying(true);
        window.open('https://stripe.com/', '_blank', 'noopener,noreferrer');
        
        setTimeout(() => {
            onPay();
        }, 2000); 
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <Card title="Order Summary">
                    <ul className="space-y-3">
                        {configurations.map(config => (
                            <li key={config.id} className="flex justify-between items-start text-sm">
                                <div>
                                    <p className="font-medium text-[#293c51] dark:text-gray-200">{config.name} x {config.quantity}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{`${config.subscriptionTermValue} ${config.subscriptionTermUnit}${config.subscriptionTermValue > 1 ? 's' : ''}`}</p>
                                </div>
                                <p className="font-semibold text-gray-700 dark:text-gray-300">${config.unitSubtotalMonthly.toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-baseline">
                        <span className="text-lg font-bold text-[#293c51] dark:text-gray-100">Total</span>
                        <span className="text-2xl font-bold text-[#679a41] dark:text-emerald-400">${totalAmount.toFixed(2)}/mo</span>
                    </div>
                </Card>
            </div>
            <div>
                 <Card title="Payment Details">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">Continue your payment securely with Stripe Financial.</p>
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png" 
                            alt="Stripe Logo" 
                            className="h-12 object-contain"
                        />
                        <div className="flex items-start text-left text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <Icon name="fas fa-lock" className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                            <p>
                                You will be redirected to Stripe to complete your payment. We do not store any of your personal details or credit card information on our servers.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" variant="outline" onClick={onBack} disabled={isPaying}>Back to Configuration</Button>
                        <Button onClick={handlePaymentRedirect} isLoading={isPaying} disabled={isPaying}>
                            {isPaying ? 'Processing...' : 'Pay with Stripe'}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const ConfirmationStep: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const orderId = useMemo(() => `WP-CEDGE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, []);
    return (
        <Card className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="fas fa-check" className="text-3xl text-green-600 dark:text-green-400"/>
            </div>
            <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">Payment Successful!</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Your CloudEdge services are now being provisioned.</p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">Order ID: <span className="font-mono text-gray-700 dark:text-gray-300">{orderId}</span></p>
            <Button onClick={onFinish} className="mt-8">Create New Estimate</Button>
        </Card>
    );
};


export const CloudEdgeConfigurationsPage: React.FC = () => {
  const [configurations, setConfigurations] = useState<CloudEdgeConfiguration[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<CloudEdgeConfiguration | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleAddOrUpdateConfiguration = (config: CloudEdgeConfiguration) => {
    setConfigurations(prev => {
      const existingIndex = prev.findIndex(c => c.id === config.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = config;
        return updated;
      }
      return [...prev, config];
    });
    setEditingConfig(null);
  };

  const handleEditConfiguration = (configId: string) => {
    const configToEdit = configurations.find(c => c.id === configId);
    if (configToEdit) {
        setEditingConfig(configToEdit);
        setIsModalOpen(true);
    }
  };
  
  const handleRemoveConfiguration = (configId: string) => {
    setConfigurations(prev => prev.filter(c => c.id !== configId));
  };

  const openAddModal = () => {
    setEditingConfig(null);
    setIsModalOpen(true);
  }

  const totalMonthlyEstimate = useMemo(() => {
    return configurations.reduce((sum, config) => sum + config.unitSubtotalMonthly, 0);
  }, [configurations]);

  const resetFlow = useCallback(() => {
    setConfigurations([]);
    setCurrentStep(0);
  }, []);

  const steps = [
    { name: 'Summary' },
    { name: 'Payment' },
    { name: 'Confirmation' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">CloudEdge Configurations</h1>
      
      <div className="w-full md:w-3/4 lg:w-1/2 mx-auto">
        <Stepper steps={steps} currentStep={currentStep} className="my-8" />
      </div>

      {currentStep === 0 && (
        <>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-3/5 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-[#293c51] dark:text-gray-100">Your Configurations</h2>
                    <Button onClick={openAddModal} leftIconName="fas fa-plus-circle" leftIconClassName="w-5 h-5">Add Configuration</Button>
                </div>
                {configurations.length === 0 ? (
                    <Card>
                    <p className="text-gray-500 dark:text-gray-400 py-4 text-center">No configurations added yet. Click "Add Configuration" to get started.</p>
                    </Card>
                ) : (
                    configurations.map(config => (
                    <ConfigurationItemCard key={config.id} config={config} onEdit={handleEditConfiguration} onRemove={handleRemoveConfiguration} />
                    ))
                )}
                </div>
                <div className="lg:w-2/5">
                <EstimateSummaryCard configurations={configurations} />
                </div>
            </div>
                
            <div className="mt-8 flex justify-end pt-4 border-t dark:border-slate-700">
                <Button 
                    onClick={() => setCurrentStep(1)} 
                    disabled={configurations.length === 0}
                    leftIconName="fas fa-credit-card"
                    leftIconClassName="w-5 h-5"
                >
                    Proceed to Payment
                </Button>
            </div>
        </>
      )}

      {currentStep === 1 && (
        <PaymentStep
            configurations={configurations}
            totalAmount={totalMonthlyEstimate}
            onBack={() => setCurrentStep(0)}
            onPay={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 &&(
          <ConfirmationStep onFinish={resetFlow} />
      )}
      
      {isModalOpen && (
        <AddCloudEdgeConfigurationModal 
            isOpen={isModalOpen} 
            onClose={() => { setIsModalOpen(false); setEditingConfig(null); }} 
            onAddConfiguration={handleAddOrUpdateConfiguration}
            editingConfig={editingConfig}
        />
      )}
    </div>
  );
};
