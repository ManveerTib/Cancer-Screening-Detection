import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Globe, Search, Mic, MicOff, Info, CheckCircle,Zap, Save, X, ChevronUp, Edit } from 'lucide-react';
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
interface SolutionDropdownProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    onDropdownToggle?: (isOpen: boolean) => void;
    isModal?: boolean;
    isModalOpen?: boolean;
}
interface SolutionItem {
    id: string;
    label: string;
    isInput?: boolean;
    placeholder?: string;
    children?: SolutionItem[];
}


const solutionData: SolutionItem[] = [
    {
        id: 'open-gdco',
        label: 'Open GDCO',
    },
    { id: 'push-to-configuration', label: 'Push to configuration' },
    { id: 'push-to-diagnostic', label: 'Push to Diagnostic' },
    {
        id: 'proforge',
        label: 'PROFORGE',
        children: [{ id: 'default', label: 'Default' }]
    },
    { id: 'syndrome-engine-flare', label: 'Syndrome Engine/Flare' },
    { id: 'fw-update', label: 'FW Update' },
    { id: 'other', label: 'Other' }
];
const SolutionDropdown: React.FC<SolutionDropdownProps> = ({
    value,
    onChange,
    disabled = false,
    onDropdownToggle,
    isModal = false,
    isModalOpen = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherText, setOtherText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [locationText, setLocationText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [showKeywords, setShowKeywords] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const [extractedKeywords, setExtractedKeywords] = useState<any>(null);
    const [convertedJSON, setConvertedJSON] = useState<any>(null);
    const [showJSONPreview, setShowJSONPreview] = useState(false);
    const [jsonTextArea, setJsonTextArea] = useState('');
    const [showApplyStructuredData, setShowApplyStructuredData] = useState(false);
    const [hasUsedSpeechRecording, setHasUsedSpeechRecording] = useState(false);
    const [hasManualTextEntry, setHasManualTextEntry] = useState(false);
    const [manualTextFields, setManualTextFields] = useState({
        vePath: '',
        faultCode: '',
        location: ''
    });
    const [activeTab, setActiveTab] = useState<'form' | 'voice'>('form');
    const [voiceInputVePath, setVoiceInputVePath] = useState('');
    const [showGDCOForm, setShowGDCOForm] = useState(false);
    const [gdcoFormData, setGdcoFormData] = useState({
        selectedPath: '',
        selectedValue: '',
        faultCode: '',
        location: '',
        vePath: '',
        isCustomInput: false,
        action: '',
        customAction: '',
        component: '',
        customComponent: ''
    });
    const [showGDCOMainForm, setShowGDCOMainForm] = useState(false);
    const [customInputValues, setCustomInputValues] = useState<{ [key: string]: string }>({});
    const [showKeywordsGuide, setShowKeywordsGuide] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [jsonErrorLine, setJsonErrorLine] = useState<number | null>(null);
    const [isJsonValid, setIsJsonValid] = useState(true);
    const [isJsonEditing, setIsJsonEditing] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
    const translationRecognizerRef = useRef<SpeechSDK.TranslationRecognizer | null>(null);
    const jsonTextareaRef = useRef<HTMLTextAreaElement>(null);
    const jsonOverlayRef = useRef<HTMLDivElement>(null);
    const [filterText, setFilterText] = useState('');
    const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
        if (isModal) {
            const allItemIds = new Set<string>();
            const collectIds = (items: SolutionItem[]) => {
                items.forEach(item => {
                    if (item.children && item.children.length > 0) {
                        allItemIds.add(item.id);
                        collectIds(item.children);
                    }
                });
            };
            collectIds(solutionData);
            return allItemIds;
        }
        return new Set();
    });
    const keywordSuggestions = [
        {
            key: 'Action → Replace',
        },
        {
            key: 'Reason → CSIDiagInfra_35670',
        },
        {
            key: 'ComponentType → Fpga',
        },
        {
            key: 'FaultCode → 35670',
        },
        {
            key: 'Mnemonic → INFRA_FPGA_ER_SOC_PORT_DOWN',
        },
        {
            key: 'DiagnosticModule → RmQuery',
        },
        {
            key: 'DERMarker → CSI_ERR',
        },
        {
            key: 'ComponentCategory → Fpga',
        },
        {
            key: 'SourceOfFault → CSIDiagInfra',
        },
        {
            key: 'Manufacturer → QUANTA COMPUTER INC. or INGRASYS TECHNOLOGY INC',
        },
        {
            key: 'SerialNumber → P65194322048003A',
        },
        {
            key: 'ModelNumber → M1096519-005',
        },
        {
            key: 'Location → PCIe Slot #1',
        },
        {
            key: 'Subclass1 → SoCPort',
        },
        {
            key: 'Diagnostic_Summary → FPGA connection to SOC is down',
        },
        {
            key: 'DateandTimestamp → 2025-09-10_11:25:55',
        }
    ];


    const languages = [
        { name: 'English', code: 'en-US' },
        { name: 'Spanish', code: 'es-ES' },
        { name: 'French', code: 'fr-FR' },
        { name: 'German', code: 'de-DE' },
        { name: 'Italian', code: 'it-IT' },
        { name: 'Portuguese', code: 'pt-PT' },
        { name: 'Chinese', code: 'zh-CN' },
        { name: 'Japanese', code: 'ja-JP' },
        { name: 'Korean', code: 'ko-KR' },
        { name: 'Arabic', code: 'ar-SA' },
        { name: 'Hindi', code: 'hi-IN' },
        { name: 'Russian', code: 'ru-RU' }
    ];

    const AZURE_SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY || '';
    const AZURE_SPEECH_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'eastus2';

    // Helper function to get line and column from position
    const getLineAndColumn = (str: string, index: number) => {
        const lines = str.substring(0, index).split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        return { line, column };
    };

    // Validate JSON function
    const validateJson = (text: string) => {
        if (!text.trim()) {
            setJsonError(null);
            setJsonErrorLine(null);
            setIsJsonValid(true);
            return;
        }

        try {
            JSON.parse(text);
            setJsonError(null);
            setJsonErrorLine(null);
            setIsJsonValid(true);
        } catch (err: any) {
            const match = err.message.match(/position\s+(\d+)/i);
            if (match) {
                const pos = parseInt(match[1], 10);
                const { line, column } = getLineAndColumn(text, pos);
                setJsonError(`JSON Error: ${err.message}\n➡️ At line ${line}, column ${column}`);
                setJsonErrorLine(line);
            } else {
                setJsonError(`JSON Error: ${err.message}`);
                setJsonErrorLine(null);
            }
            setIsJsonValid(false);
        }
    };

    // Handle JSON textarea change
    const handleJsonTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setJsonTextArea(newValue);
        validateJson(newValue);
    };

    // Handle JSON textarea scroll
    const handleJsonScroll = () => {
        if (jsonOverlayRef.current && jsonTextareaRef.current) {
            jsonOverlayRef.current.scrollTop = jsonTextareaRef.current.scrollTop;
            jsonOverlayRef.current.scrollLeft = jsonTextareaRef.current.scrollLeft;
        }
    };

    // Render highlighted JSON text
    const renderHighlightedJsonText = () => {
        return jsonTextArea.split('\n').map((line, idx) => {
            const lineNumber = idx + 1;
            return (
                <div
                    key={idx}
                    className={`whitespace-pre ${
                        jsonErrorLine === lineNumber ? 'bg-red-200 dark:bg-red-900/50' : ''
                    }`}
                >
                    {line || ' '}
                </div>
            );
        });
    };

    const extractKeywordsFromSpeech = (text: string) => {
        const componentTypeMatch = text.match(
            /(?:M\.2|M2|NVMe|SSD|HDD|Disk|Drive|Memory|RAM|DIMM|NVDIMM|CPU|Processor|GPU|TPU|ASIC|FPGA|Motherboard|Chassis|Backplane|Blade|Server|PSU|Power\s*Supply|PDU|Battery|BBU|Fan|Heatsink|Cooling|Network\s*Card|NIC|Ethernet|Fiber|Cable|Transceiver|SFP|QSFP|RAID\s*Controller|Switch)/i
        );
        const actionMatch = text.match(
            /(?:Replace|Repair|Reseat|Receipt|Restart|Reboot|Reset|Remove|Install|Uninstall|Upgrade|Update|Patch|Fix|Check|Inspect|Monitor|Test|Clean|Configure|Reconnect|Swap|Add|Power\s*On|Power\s*Off|Shut\s*Down|Start|Stop)/i
        );

        const faultCodeMatch = text.match(/\b\d{2,3}[,]?\d{2,3}\b/);

        const locationMatch =
            text.match(
                /(?:connector|slot|bay|port|socket|channel|rack|row|u\s*position|unit|cage|enclosure|module|node|cpu\s*socket|memory\s*slot)\s*#?\s*(\d+)/i
            ) ||
            text.match(/(?:slot|bay|port)\s*(\d+)/i);

        const serialMatch = text.match(/(?:serial|SN|S\/N)[\s:]*([A-Z0-9]+)/i);

        const mnemonicMatch = text.match(
            /\b(?!Action|Location|Fault|Code)[A-Z0-9]+(?:_[A-Z0-9]+)*\b/i
        );

        const diagnosticModuleMatch = text.match(
            /\b(?:ServerTopology|Processor|NICDiag|RmQuery|HMSTrap_Sparkle:Sparkle|MQE-ManualOFR|MiscDiag|NA|HwDiagLnx-GPUDiag|IPMI|CsiDiagInfra|HPC\s+GuestHealthReporting\s+XID109ContextSwitchTimeoutGDCO|Sparkle:Sparkle|ApiSensorReading|RiserCard|Sel|DiskDiagnostics|Sparkle-RuleId-\d+|NvmeDiagnostics)\b/i
        );
        const dermarkerMatch = text.match(
            /\b(?:CSI_ERR|INFRA_ERR|DISK_ERR|GPU_ERR|CPU_ERR|MEM_ERR|PSU_ERR|FAN_ERR|NIC_ERR|FPGA_ERR|MB_ERR|HM_ERR|SEL_ERR|RAID_ERR)\b/i
        );
        const BslHwSkuModelMatch = text.match(
            /\b(?:Wiwynn|Ingrasys|Lenovo|ZT|Quanta|Microsoft|DellXIO)[\w\-.]+WCS-[A-Z0-9]+(?:_[\w.]+)?\b/
        );
        const MotherboardLayoutNameMatch = text.match(
            /\b(?:(?:Non)?WCS_Gen\d+\.x_[A-Z0-9]+_(?:Wiwynn|Ingrasys|Lenovo|ZTSystems|Quanta|Dell|Microsoft)|ZT-[\w.-]+WCS-[A-Z0-9]+|C\d{3,5})\b/i
        );

        const componentCategoryMatch = text.match(
            /\b(?:GPU\s*Tray|Server\s*Chassis|MotherBoard|System\s*Board|HPM\s*Board|Server\s*Blade|CPU|Proc|Processor|Fpga|FPGA|GPU\s*Module|GPU|PCIe|Disk|NVMe\s*Drive|Switchboard|SvrMemory|SvrSSD|DIMM|Memory|Array\s*Controller|Power\s*Supply|Pwr\s*Cords?|Fan|RiserCard|Cable|DAC\s*Cable|AEC\s*Y\s*Cable|DC-SCM|Unknown)\b/i
        );

        const sourceoffaultMatch = text.match(
            /\b(?:Contact\s*CSIRM@[\w\d]*|Manual[_\s]*Ticket|Manual[_\s]*Push|Manual[_\s]*debug|Manual[_\s]*OaaS|MQE-ManualOFR|CSIDiag(?:Infra)?|csidiag|BIOS_TPM|HHS|ContactAlias-[\w\d]+\s*Investigate@[\w\d]+|SIGAS\s*CHAT\s*FD\s*AI|Fleet\s*Engineering\s*Debug\s*Forum(?:\s*Ticket)?|Azure\s*HPC|RMAhistory\s*of\s*SoCDiagnosticsActivity|Cloud\s*Hardware\s*Infrastructure\s*Engineering\s*\(CHIE\)(?::|\\)\s*CHIE\s*Fleet\s*Engineering\s*Debug\s*Forum)\b/i
        );

        const manufacturerMatch = text.match(
            /\b(?:Microsoft|APC|Unknown|Not_Applicable|UNKNOWN|AMD|Samsung|Geist|INGRASYS TECHNOLOGY INC|QUANTA COMPUTER INC\.|Hynix|Hynix Semiconductor|NotAvailable|AuthenticAMD|Digi|BIOS\/FW should be up to date|LENOVO|GenuineIntel|NVIDIA|SK Hynix|Dell|ADVANCED MICRO DEVICES \(AMD\)|Micron|OCP Mellanox NIC card|NA|HP|E|SKhynix)\b/i
        );

        const modelNumberMatch = text.match(
            /\b(?:OCS|PowerStrip|Unknown|WCS|Not_Applicable|NA|Long|Short|Fan|RackScm|Remediation ID\s*:\s*\d+|ProLiant SL Advanced Power Manager Controller|MI300x UBB|MI300HF UBB|Hopper Baseboard|Delta-Next Baseboard|CM 48|[A-Z0-9\-]{3,}(?:_[A-Z0-9]+)?|(?:Intel\(R\)\s+Xeon\(R\)\s+Platinum\s+\d+[A-Z]*\s*(?:CPU.*)?)|(?:AMD EPYC\s+\d+.*)|SAMSUNG\s+[A-Z0-9\-]+|HFS[0-9A-Z\-]+|HMA[0-9A-Z\-]+|M\d{6,}-\d{3}|[0-9]{3,5}-[0-9]{3}-[A-Z0-9]{1,3})\b/gi
        );
        const subclass1Match = text.match(
            /\b(?:SEL:RID=\d+:[A-Za-z0-9]+|UNKNOWN|MQE-ManualOFR|Not_Applicable|FpgaNic|SoCPort|RMAHistory|NicPort|RackManager|TorPort|Nvme|ChassisFan|NA|Multi_Missing_Components|Single_Missing_Component|0x[0-9A-Fa-f]+|\d+|Hms\d+|C\d{3,5}|HmsCode:\d+->\d+|PCIe:BDF=\d+:\d+(?:_\d+)?(?:\.\d+)?)\b/g
        );
        const subclass2Match = text.match(
            /\b(?:GpuBbStateEvent|UNKNOWN|MQE-ManualOFR|Not_Applicable|Sel|Sparkle:Sparkle|NA|XID\d+\s+failure|Disk Issue Detection from WEL Policy \(Parameterized Action\)|Topology_V\d+|M\d{7}-\d{3}|VEN_[0-9A-Fa-f]{4}&DEV_[0-9A-Fa-f]{4}|0x[0-9A-Fa-f]+|\d{1,6}|(?:\d+:){2}\d+\.\d+)\b/g
        );

        const summaryMatch = text.match(
            /\b(?:FPGA|GPU|CPU|Disk|NIC|PCIe|RiserCard|Fan|Cable|Server|Processor|HCA|PXE|Boot|Tray|Switch|SoC|Topology|Sel|CSIDIAG|gpu_ctx_switch_timeout|CriticalWarning|Error|Failure|Degraded|Defective|Disconnected|Missing|Not\s+seated|Loose|Opportunistic|Replacement|Connectivity|Mismatch|Timeout)[\s\S]+/i
        );
         
        return {
            componentType: componentTypeMatch ? componentTypeMatch[0] : 'M.2 Drive',
            action: actionMatch ? actionMatch[0] : 'Unknown',
            faultCode: faultCodeMatch ? faultCodeMatch[0].replace(/,/g, '') : 'Unknown',
            location: locationMatch ? `Slot ${locationMatch[1]}` : "Unknown",
            serialNumber: serialMatch ? serialMatch[1] : 'Unknown',
            originalText: text,
            mnemonic: mnemonicMatch ? mnemonicMatch[1] : 'Unknown',
            diagnosticModule: diagnosticModuleMatch ? diagnosticModuleMatch[1] : 'Unknown',
            dermarker: dermarkerMatch ? dermarkerMatch[1] : 'Unknown',
            bslHwSkuModel: BslHwSkuModelMatch ? BslHwSkuModelMatch[0] : 'Unknown',
            MotherboardLayoutName: MotherboardLayoutNameMatch ? MotherboardLayoutNameMatch[0] : 'Unknown',
            componentCategory: componentCategoryMatch ? componentCategoryMatch[0] : 'Unknown',
            sourceoffault: sourceoffaultMatch ? sourceoffaultMatch[0] : 'Unknown',
            manufacturer: manufacturerMatch ? manufacturerMatch[0] : 'Unknown',
            modelNumber: modelNumberMatch ? modelNumberMatch[0] : 'Unknown',
            subclass1: subclass1Match ? subclass1Match[0] : 'Unknown',
            subclass2: subclass2Match ? subclass2Match[0] : 'Unknown',
            summary: summaryMatch ? summaryMatch[0] : 'Unknown' 

        };
    };

    const convertKeywordsToJSON = (keywords: any) => {
        const structuredData = {
            "$type": "CSIDiagnostic/1.1",
            "Action": keywords.action,
            "Reason": `CSIDiag_${keywords.faultCode}`,
            "ComponentType": keywords.componentType,
            "FaultCode": keywords.faultCode,
            "Mnemonic": keywords.mnemonic,
            "DiagnosticModule": keywords.diagnosticModule,
            "ExecutionId": crypto.randomUUID(),
            "DERMarker": keywords.dermarker,
            "CSIDiagVersion": "1.1.7.0",
            "BslHwSkuModel": keywords.bslHwSkuModel,
            "MotherboardLayoutName": keywords.MotherboardLayoutName,
            "ComponentCategory": keywords.componentCategory,
            "TotalParts": 1,
            "SourceOfFault": keywords.sourceoffault,
            "PartFailures": [{
                "Manufacturer": keywords.manufacturer,
                "SerialNumber": keywords.serialNumber,
                "ModelNumber": keywords.modelNumber,
                "Location": keywords.location,
                "Subclass1": keywords.subclass1,
                "Subclass2": keywords.subclass2,
                "Diagnostic_Summary": keywords.summary,
                "DateandTimestamp": new Date().toISOString().replace('T', ' ').substring(0, 19),
                "Count": 1
            }]
        };

        return structuredData;
    };


    // Filter solution data based on filter text
    // recursive filter helper
    function filterSolutionData(items: SolutionItem[]): SolutionItem[] {
        if (!filterText.trim()) return items;

        return items
            .filter(item => {
                const matchesFilter = item.label.toLowerCase().includes(filterText.toLowerCase());
                const hasMatchingChildren =
                    item.children && filterSolutionData(item.children).length > 0;
                return matchesFilter || hasMatchingChildren;
            })
            .map(item => ({
                ...item,
                children: item.children ? filterSolutionData(item.children) : undefined,
            }));
    }

    // usage
    const filteredSolutionData = filterSolutionData(solutionData);

    const toggleDropdown = (open: boolean) => {
        setIsOpen(open);
        if (onDropdownToggle) {
            onDropdownToggle(open);
        }
    };
    const handleLocationChange = (newLocation: string) => {
        setLocationText(newLocation);

        // Update the main value to include location
        if (value && !value.startsWith('Other:')) {
            const baseValue = value.split(' | Location:')[0]; // Remove existing location if any
            const finalValue = newLocation.trim()
                ? `${baseValue} | Location: ${newLocation.trim()}`
                : baseValue;
            onChange(finalValue);
        }
    };

    const startRecording = () => {
        if (!AZURE_SPEECH_KEY || AZURE_SPEECH_KEY === 'your-azure-speech-key') {
            console.error('Azure Speech Service key not configured. Please set REACT_APP_AZURE_SPEECH_KEY environment variable.');
            return;
        }


        try {
            const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
            const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

            const selectedLangCode = languages.find(lang => lang.name === selectedLanguage)?.code || 'en-US';

            if (selectedLanguage === 'English') {
                // Direct speech recognition for English
                speechConfig.speechRecognitionLanguage = selectedLangCode;
                const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
                recognizerRef.current = recognizer;

                recognizer.recognizing = (s, e) => {
                    setRecognizedText(e.result.text);
                };

                recognizer.recognized = (s, e) => {
                    if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                        setOtherText(prev => prev + ' ' + e.result.text);
                    }
                };

                recognizer.canceled = (s, e) => {
                    console.error('Speech recognition canceled:', e.errorDetails);
                    setIsRecording(false);
                };

                recognizer.sessionStopped = (s, e) => {
                    setIsRecording(false);
                    handleRecordingStopped();
                };

                recognizer.startContinuousRecognitionAsync();

            } else {
                // Translation configuration for non-English languages
                const translationConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
                translationConfig.speechRecognitionLanguage = selectedLangCode;
                translationConfig.addTargetLanguage('en'); // Always translate to English

                const translationRecognizer = new SpeechSDK.TranslationRecognizer(translationConfig, audioConfig);
                translationRecognizerRef.current = translationRecognizer;

                translationRecognizer.recognizing = (s, e) => {
                    setRecognizedText(e.result.text);
                    if (e.result.translations.get('en')) {
                        setTranslatedText(e.result.translations.get('en'));
                    }
                };

                translationRecognizer.recognized = (s, e) => {
                    if (e.result.reason === SpeechSDK.ResultReason.TranslatedSpeech) {
                        const englishTranslation = e.result.translations.get('en');
                        if (englishTranslation) {
                            setOtherText(prev => prev + ' ' + englishTranslation);
                        }
                    }
                };

                translationRecognizer.canceled = (s, e) => {
                    console.error('Translation recognition canceled:', e.errorDetails);
                    setIsRecording(false);
                    setIsTranslating(false);
                };

                translationRecognizer.sessionStopped = (s, e) => {
                    setIsRecording(false);
                    setIsTranslating(false);
                    handleRecordingStopped();
                };

                setIsTranslating(true);
                translationRecognizer.startContinuousRecognitionAsync();
            }

            setIsRecording(true);
            setHasManualTextEntry(false); // Clear manual entry flag when starting speech

        } catch (error) {
            console.error('Azure Speech Service error:', error);
            console.error('Failed to start speech recognition. Please check your Azure Speech Service configuration.');
        }
    };

    const stopRecording = () => {
        if (recognizerRef.current) {
            recognizerRef.current.stopContinuousRecognitionAsync();
            recognizerRef.current.close();
            recognizerRef.current = null;
        }

        if (translationRecognizerRef.current) {
            translationRecognizerRef.current.stopContinuousRecognitionAsync();
            translationRecognizerRef.current.close();
            translationRecognizerRef.current = null;
        }

        setIsRecording(false);
        setIsTranslating(false);
        setRecognizedText('');
        setHasUsedSpeechRecording(true);
        handleRecordingStopped();
    };

    // Check if current selection requires location field
    const shouldShowLocationField = () => {
        if (!value || value === 'other' || value.startsWith('Other: ')) {
            return false;
        }

        // Check if the value starts with "Open GDCO >"
        if (value.startsWith('Open GDCO >')) {
            // Split the path to check the structure
            const pathParts = value.split(' > ');

            // If it's "Open GDCO > Action > Reseat" or "Open GDCO > Component > FPGA" etc.
            // (3 parts means it's a leaf node under Open GDCO)
            if (pathParts.length >= 3) {
                return true;
            }
        }

        return false;
    };

    const handleRecordingStopped = () => {
        // Extract keywords from speech when recording stops
        if (otherText.trim()) {
            const keywords = extractKeywordsFromSpeech(otherText);
            setExtractedKeywords(keywords);
            setShowJSONPreview(true);
            setShowApplyStructuredData(true);
        }
    };

    const handleOtherTextChange = (value: string) => {
        setOtherText(value);
        // Only set manual entry flag if not currently recording or haven't used speech
        if (!isRecording && !hasUsedSpeechRecording) {
            setHasManualTextEntry(value.trim().length > 0);
        }
    };

    const handleApplyStructuredData = () => {
        if (extractedKeywords) {
            const jsonData = convertKeywordsToJSON(extractedKeywords);
            setConvertedJSON(jsonData);
            setJsonTextArea(JSON.stringify(jsonData, null, 2));
            validateJson(JSON.stringify(jsonData, null, 2));
            setShowApplyStructuredData(false);
        }
    };

    const handleApply = () => {
        let finalValue = '';

        if (activeTab === 'form') {
            // Form Input Tab - Convert to JSON format
            const formData: any = {
                "ActionSelected": `Other: ${otherText.trim()}`,
                "Other": otherText.trim(),
                "VE Path": manualTextFields.vePath,
                "Fault Code": manualTextFields.faultCode,
                "Location": manualTextFields.location
            };
            finalValue = JSON.stringify(formData, null, 2);
        } else if (activeTab === 'voice') {
            // Voice Input Tab - Use JSON with VE Path
            if (jsonTextArea.trim()) {
                try {
                    const jsonData = JSON.parse(jsonTextArea);
                    // Add ActionSelected key for Other voice input
                    if (otherText.trim() && !jsonData["ActionSelected"]) {
                        jsonData["ActionSelected"] = `Other: ${otherText.trim()}`;
                    }
                    if (voiceInputVePath.trim()) {
                        jsonData["VE Path"] = voiceInputVePath.trim();
                    }
                    finalValue = JSON.stringify(jsonData, null, 2);
                } catch (e) {
                    finalValue = jsonTextArea;
                }
            }
        } else {
            // Fallback for backward compatibility
            if (hasUsedSpeechRecording && jsonTextArea.trim()) {
                finalValue = jsonTextArea;
            } else if (otherText.trim()) {
                finalValue = otherText;
                if (manualTextFields.vePath) {
                    finalValue += ` | VE Path: ${manualTextFields.vePath}`;
                }
                if (manualTextFields.faultCode) {
                    finalValue += ` | To Fault Code: ${manualTextFields.faultCode}`;
                }
                if (manualTextFields.location) {
                    finalValue += ` | Location: ${manualTextFields.location}`;
                }
            }
        }
        
        if (finalValue) {
            onChange(finalValue);
            setShowOtherInput(false);
            setOtherText('');
            setManualTextFields({ vePath: '', faultCode: '', location: '' });
            setVoiceInputVePath('');
            setHasUsedSpeechRecording(false);
            setHasManualTextEntry(false);
            setExtractedKeywords(null);
            setConvertedJSON(null);
            setJsonTextArea('');
            setShowJSONPreview(false);
            setShowApplyStructuredData(false);
            setIsTranslating(false);
            setActiveTab('form');
            setIsJsonEditing(false);
            setJsonError(null);
            setJsonErrorLine(null);
            setIsJsonValid(true);
            toggleDropdown(false);
        }
    };

    const handleCancel = () => {
        setShowOtherInput(false);
        setOtherText('');
        setManualTextFields({ vePath: '', faultCode: '', location: '' });
        setVoiceInputVePath('');
        setHasUsedSpeechRecording(false);
        setHasManualTextEntry(false);
        setExtractedKeywords(null);
        setConvertedJSON(null);
        setJsonTextArea('');
        setShowJSONPreview(false);
        setShowApplyStructuredData(false);
        setIsTranslating(false);
        setActiveTab('form');
        setIsJsonEditing(false);
        setJsonError(null);
        setJsonErrorLine(null);
        setIsJsonValid(true);
    };

    const toggleExpanded = (itemId: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) newSet.delete(itemId);
            else newSet.add(itemId);
            return newSet;
        });
    };

    const handleItemSelect = (item: SolutionItem, path: string[] = []) => {
        // Handle input items
        if (item.isInput) {
            return; // Don't select input items directly
        }
        let fullPath = "";
        if (item.id === 'other') {
            // Update the dropdown value to show "Open GDCO > Other"
            fullPath = [...path, item.label].join(' > ');
            onChange(fullPath);
            setShowOtherInput(true);
            return;
        } else if (item.id === 'open-gdco') {
            setShowGDCOMainForm(true);
            onChange(fullPath);
        }

        // Check if this is a GDCO sub-selection that needs a form
        fullPath = [...path, item.label].join(' > ');
        const isGDCOAction = fullPath.startsWith('Open GDCO > Action >') && path.length >= 2;
        const isGDCOComponent = fullPath.startsWith('Open GDCO > Component >') && path.length >= 2;

        if (isGDCOAction || isGDCOComponent) {
            setGdcoFormData({
                selectedPath: fullPath,
                selectedValue: item.label,
                faultCode: '',
                location: '',
                vePath: '',
                isCustomInput: false,
                action: '',
                customAction: '',
                component: '',
                customComponent: ''
            });
            setShowGDCOForm(true);
            // Hide the dropdown when form is shown
            if (!isModal) {
                toggleDropdown(false);
            }
            return;
        }

        if (!item.children || item.children.length === 0) {
            onChange(fullPath);

            // Reset location when changing selection
            setLocationText('');

            toggleDropdown(false);
            setShowOtherInput(false);
        }
    };

    const handleCustomInputSubmit = (inputId: string, value: string, path: string[]) => {
        if (!value.trim()) return;

        const fullPath = [...path, value].join(' > ');

        setGdcoFormData({
            selectedPath: fullPath,
            selectedValue: value,
            faultCode: '',
            location: '',
            vePath: '', // VE Path will be shown for custom inputs
            isCustomInput: true, // Flag to show VE Path field
            action: '',
            customAction: '',
            component: '',
            customComponent: ''
        });
        setShowGDCOForm(true);
        // Clear the input after submission
        setCustomInputValues(prev => ({
            ...prev,
            [inputId]: ''
        }));
        // Hide the dropdown when form is shown
        if (!isModal) {
            toggleDropdown(false);
        }
    };

    const handleGDCOFormApply = () => {
        if (showGDCOMainForm) {
            // Generate CSIDiagnostic JSON payload
            const actionValue = gdcoFormData.action === 'Others' ? gdcoFormData.customAction : gdcoFormData.action;
            const componentValue = gdcoFormData.component === 'Others' ? gdcoFormData.customComponent : gdcoFormData.component;

            const currentDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

            const jsonPayload: any = {
                "$type": "CSIDiagnostic/1.1",
                "Action": actionValue,
                "Reason": "CSIDiag_Unknown",
                "ComponentType": componentValue || "Unknown",
                "FaultCode": gdcoFormData.faultCode,
                "Mnemonic": "Unknown",
                "DiagnosticModule": "Unknown",
                "ExecutionId": "8a93c194-23ac-45da-931d-a088394e98e5",
                "DERMarker": "Unknown",
                "CSIDiagVersion": "1.1.7.0",
                "MotherboardLayoutName": "Unknown",
                "ComponentCategory": componentValue || "Unknown",
                "TotalParts": 1,
                "SourceOfFault": "Unknown",
                "PartFailures": [
                    {
                        "Manufacturer": "Unknown",
                        "SerialNumber": "Unknown",
                        "ModelNumber": "Unknown",
                        "Location": gdcoFormData.location,
                        "Subclass1": "Unknown",
                        "Subclass2": "Unknown",
                        "Diagnostic_Summary": "Unknown",
                        "DateandTimestamp": currentDateTime,
                        "Count": 1
                    }
                ]
            };

            // Add ActionSelected key for Open GDCO
            jsonPayload["ActionSelected"] = "Open GDCO";

            // Add VE Path if provided
            if (gdcoFormData.vePath) {
                jsonPayload["VE Path"] = gdcoFormData.vePath;
            }

            // Convert to formatted JSON string
            const formattedJSON = JSON.stringify(jsonPayload, null, 2);

            onChange(formattedJSON);
        } else {
            // Handle legacy GDCO form (for other items if any)
            const isCustomInput = gdcoFormData.selectedPath.includes('other-action') || gdcoFormData.selectedPath.includes('other-component');
            let result = gdcoFormData.selectedPath;

            if (gdcoFormData.faultCode) {
                result += ` | To Fault Code: ${gdcoFormData.faultCode}`;
            }
            if (gdcoFormData.location) {
                result += ` | Location: ${gdcoFormData.location}`;
            }
            if (gdcoFormData.vePath && isCustomInput) {
                result += ` | VE Path: ${gdcoFormData.vePath}`;
            }

            onChange(result);
        }
        
        setShowGDCOForm(false);
        setShowGDCOMainForm(false);
        setGdcoFormData({
            selectedPath: '',
            selectedValue: '',
            faultCode: '',
            location: '',
            vePath: '',
            isCustomInput: false,
            action: '',
            customAction: '',
            component: '',
            customComponent: ''
        });

        if (!isModal) {
            // Don't auto-close dropdown, let user continue selecting
        }
    };

    const handleGDCOFormCancel = () => {
        setShowGDCOForm(false);
        setShowGDCOMainForm(false);
        setGdcoFormData({
            selectedPath: '',
            selectedValue: '',
            faultCode: '',
            location: '',
            vePath: '',
            isCustomInput: false,
            action: '',
            customAction: '',
            component: '',
            customComponent: ''
        });
        // Show dropdown again when canceling
        if (!isModal) {
            toggleDropdown(true);
        }
    };

    const handleCustomInputChange = (inputId: string, value: string) => {
        setCustomInputValues(prev => ({
            ...prev,
            [inputId]: value
        }));
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (recognizerRef.current) {
                recognizerRef.current.close();
            }
            if (translationRecognizerRef.current) {
                translationRecognizerRef.current.close();
            }
        };
    }, []);

    const renderMenuItem = (
        item: SolutionItem,
        level: number = 0,
        path: string[] = []
    ) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.id);
        const currentPath = [...path, item.label];
        const inputValue = customInputValues[item.id] || '';

        return (
            <div key={item.id}>
                {item.isInput ? (
                    <div className={`px-3 py-2 ${level > 0 ? `ml-${level * 4}` : ''}`}
                        style={{ paddingLeft: `${12 + level * 16}px` }}>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => handleCustomInputChange(item.id, e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && inputValue.trim()) {
                                        handleCustomInputSubmit(item.id, inputValue, path);
                                    }
                                }}
                                placeholder={item.placeholder}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                onClick={() => {
                                    if (inputValue.trim()) {
                                        handleCustomInputSubmit(item.id, inputValue, path);
                                    }
                                }}
                                disabled={!inputValue.trim()}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${level > 0 ? `ml-${level * 4}` : ''
                            }`}
                        style={{ paddingLeft: `${12 + level * 16}px` }}
                        onClick={() => {
                            if (hasChildren) toggleExpanded(item.id);
                            else handleItemSelect(item, path);
                        }}
                    >
                        <div className="flex items-center space-x-2">
                            {hasChildren && (
                                <button className="text-gray-400">
                                    {isExpanded ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                            <span className="text-sm text-gray-900 dark:text-white">
                                {item.label}
                            </span>
                        </div>
                    </div>
                )}
                {hasChildren && isExpanded && (
                    <div>
                        {item.children!.map(child =>
                            renderMenuItem(child, level + 1, currentPath)
                        )}
                    </div>
                )}
            </div>
        );
    };


    const displayValue = value || 'Select solution...';
    return (
        <div className="relative z-0" ref={dropdownRef}>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => toggleDropdown(!isOpen)}
                    disabled={disabled}
                    className={`relative z-0 flex-1 flex items-center justify-between px-3 py-2 border rounded-md text-sm transition-colors ${isModal ? 'cursor-default' : ''
                        } ${disabled
                            ? 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                >
                    <span className="truncate max-w-[200px]">{displayValue}</span>
                    {!isModal && <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" />}
                </button>
            </div>

            {/* Main GDCO Form */}
            {showGDCOMainForm && !showGDCOForm && (
                <div className={`mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg ${isModal ? 'w-full' : 'absolute top-full left-0 right-0 w-80 z-[100080]'}`}>
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                            <Save className="w-4 h-4 mr-2" />
                            Open GDCO Configuration
                        </h4>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Action Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Action <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={gdcoFormData.action}
                                onChange={(e) => setGdcoFormData(prev => ({ 
                                    ...prev, 
                                    action: e.target.value,
                                    customAction: e.target.value !== 'Others' ? '' : prev.customAction
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Action</option>
                                <option value="Reseat">Reseat</option>
                                <option value="Replace">Replace</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        {/* Custom Action Input */}
                        {gdcoFormData.action === 'Others' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Custom Action <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={gdcoFormData.customAction}
                                    onChange={(e) => setGdcoFormData(prev => ({ ...prev, customAction: e.target.value }))}
                                    placeholder="Enter custom action..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        )}

                        {/* Components Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Component
                            </label>
                            <select
                                value={gdcoFormData.component}
                                onChange={(e) => setGdcoFormData(prev => ({ 
                                    ...prev, 
                                    component: e.target.value,
                                    customComponent: e.target.value !== 'Others' ? '' : prev.customComponent
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select Component</option>
                                <option value="FPGA">FPGA</option>
                                <option value="Motherboard">Motherboard</option>
                                <option value="Disk">Disk</option>
                                <option value="Processor">Processor</option>
                                <option value="PSU">PSU</option>
                                <option value="DIMM">DIMM</option>
                                <option value="Copper Network Cable">Copper Network Cable</option>
                                <option value="SATA Cable">SATA Cable</option>
                                <option value="Network Card">Network Card</option>
                                <option value="Server Blade">Server Blade</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        {/* Custom Component Input */}
                        {gdcoFormData.component === 'Others' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Custom Component <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={gdcoFormData.customComponent}
                                    onChange={(e) => setGdcoFormData(prev => ({ ...prev, customComponent: e.target.value }))}
                                    placeholder="Enter custom component..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        )}

                        {/* To Fault Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                To Fault Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={gdcoFormData.faultCode}
                                onChange={(e) => setGdcoFormData(prev => ({ ...prev, faultCode: e.target.value }))}
                                placeholder="Enter fault code..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={gdcoFormData.location}
                                onChange={(e) => setGdcoFormData(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="Enter location..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* VE Path - Only for Others */}
                        {(gdcoFormData.action === 'Others' || gdcoFormData.component === 'Others') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    VE Path
                                </label>
                                <input
                                    type="text"
                                    value={gdcoFormData.vePath}
                                    onChange={(e) => setGdcoFormData(prev => ({ ...prev, vePath: e.target.value }))}
                                    placeholder="Enter VE path..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            onClick={handleGDCOFormCancel}
                            className="flex items-center space-x-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                        </button>
                        <button
                            onClick={handleGDCOFormApply}
                            disabled={
                                !gdcoFormData.faultCode.trim() || 
                                !gdcoFormData.location.trim() ||
                                (gdcoFormData.action === 'Others' && !gdcoFormData.customAction.trim()) ||
                                (gdcoFormData.component === 'Others' && !gdcoFormData.customComponent.trim())
                            }
                            className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            <span>Apply</span>
                        </button>
                    </div>
                </div>
            )}

            {/* GDCO Form */}
            {showGDCOForm && (
                <div className={`mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg ${isModal ? 'w-full' : 'absolute top-full left-0 right-0 w-80 z-[100080]'}`}>
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                            <Save className="w-4 h-4 mr-2" />
                            Configure: {gdcoFormData.selectedValue}
                        </h4>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                            Selected: {gdcoFormData.selectedPath}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                To Fault Code *
                            </label>
                            <input
                                type="text"
                                value={gdcoFormData.faultCode}
                                onChange={(e) => setGdcoFormData(prev => ({ ...prev, faultCode: e.target.value }))}
                                placeholder="Enter to fault code..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Location *
                            </label>
                            <input
                                type="text"
                                value={gdcoFormData.location}
                                onChange={(e) => setGdcoFormData(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="Enter location..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {gdcoFormData.isCustomInput && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    VE Path
                                </label>
                                <input
                                    type="text"
                                    value={gdcoFormData.vePath}
                                    onChange={(e) => setGdcoFormData(prev => ({ ...prev, vePath: e.target.value }))}
                                    placeholder="Enter VE path..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            onClick={handleGDCOFormCancel}
                            className="flex items-center space-x-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                        </button>
                        <button
                            onClick={handleGDCOFormApply}
                            disabled={!gdcoFormData.faultCode.trim() || !gdcoFormData.location.trim()}
                            className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            <span>Apply</span>
                        </button>
                    </div>
                </div>
            )}

            {isOpen && !disabled && (!isModalOpen || isModal) && !showGDCOForm && !showGDCOMainForm && (
                <div
                    className={`
          } mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[100022] overflow-y-auto ${isModal ? 'max-h-[600px] w-full' : 'max-h-80 w-72'
                        }`}
                    style={
                        !isModal
                            ? {
                                top: `${dropdownRef.current
                                    ? dropdownRef.current.getBoundingClientRect().bottom +
                                    window.scrollY
                                    : 0
                                    }px`,
                                left: `${dropdownRef.current
                                    ? dropdownRef.current.getBoundingClientRect().left +
                                    window.scrollX
                                    : 0
                                    }px`,
                                maxWidth: '288px'
                            }
                            : undefined
                    }
                >
                    {!showOtherInput ? (
                        <div>
                            {/* Filter Section - only show in modal */}
                            {isModal && (
                                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Filter solutions..."
                                            value={filterText}
                                            onChange={(e) => setFilterText(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            )}
                            {/* Language Selection - only show in modal when Other is selected */}
                            {isModal && showOtherInput && (
                                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Globe className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Voice Language:
                                            </span>
                                        </div>
                                        <select
                                            value={selectedLanguage}
                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {languages.map((lang) => (
                                                <option key={lang.code} value={lang.name}>
                                                    {lang.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Speech will be translated to English automatically
                                    </p>
                                </div>
                            )}

                            {/* Location Field - Show for Open GDCO sub-values or when Other is selected */}
                            {(shouldShowLocationField() || showOtherInput) && (
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={locationText}
                                        onChange={(e) => handleLocationChange(e.target.value)}
                                        placeholder="Enter location..."
                                        className="relative z-[100023] w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            )}

                            <div className="py-1">
                                {filteredSolutionData.length > 0 ? (
                                    filteredSolutionData.map(item => renderMenuItem(item))
                                ) : (
                                    <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No solutions found matching "{filterText}"
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4">
                            {showOtherInput && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                    {/* Tab Navigation */}
                                    <div className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
                                        <button
                                            onClick={() => setActiveTab('form')}
                                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                                activeTab === 'form'
                                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            } ${isModal ? 'relative z-[100072]' : ''}`}
                                        >
                                            Solution (Form Input)
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('voice')}
                                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                                activeTab === 'voice'
                                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                            } ${isModal ? 'relative z-[100072]' : ''}`}
                                        >
                                            Solution (Voice Input)
                                        </button>
                                    </div>

                                    {/* Form Input Tab */}
                                    {activeTab === 'form' && (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
                                                    Other Solution
                                                </h4>
                                                <textarea
                                                    value={otherText}
                                                    onChange={(e) => handleOtherTextChange(e.target.value)}
                                                    placeholder="Enter custom solution..."
                                                    rows={4}
                                                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${isModal ? 'relative z-[100072]' : ''}`}
                                                />
                                            </div>

                                            {/* Additional Information - Always visible in form tab */}
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                                                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                                    Additional Information (Optional)
                                                </h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            VE Path
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={manualTextFields.vePath}
                                                            onChange={(e) => setManualTextFields(prev => ({ ...prev, vePath: e.target.value }))}
                                                            placeholder="Enter VE path..."
                                                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isModal ? 'relative z-[100072]' : ''}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            To Fault Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={manualTextFields.faultCode}
                                                            onChange={(e) => setManualTextFields(prev => ({ ...prev, faultCode: e.target.value }))}
                                                            placeholder="Enter fault code..."
                                                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isModal ? 'relative z-[100072]' : ''}`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Location
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={manualTextFields.location}
                                                            onChange={(e) => setManualTextFields(prev => ({ ...prev, location: e.target.value }))}
                                                            placeholder="Enter location..."
                                                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isModal ? 'relative z-[100072]' : ''}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={handleCancel}
                                                    className={`px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isModal ? 'relative z-[100072]' : ''}`}
                                                >
                                                    Close
                                                </button>
                                                <button
                                                    onClick={handleApply}
                                                    disabled={!otherText.trim()}
                                                    className={`px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium ${isModal ? 'relative z-[100072]' : ''}`}
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Voice Input Tab */}
                                    {activeTab === 'voice' && (
                                        <div className="space-y-4">
                                            {/* Voice Language */}
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Voice Language:
                                                    </label>
                                                </div>
                                                <select
                                                    value={selectedLanguage}
                                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                                    className={`px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isModal ? 'relative z-[100072]' : ''}`}
                                                >
                                                    <option value="en-US">English</option>
                                                    <option value="es-ES">Spanish</option>
                                                    <option value="fr-FR">French</option>
                                                    <option value="de-DE">German</option>
                                                    <option value="it-IT">Italian</option>
                                                    <option value="pt-BR">Portuguese</option>
                                                    <option value="ja-JP">Japanese</option>
                                                    <option value="ko-KR">Korean</option>
                                                    <option value="zh-CN">Chinese (Simplified)</option>
                                                </select>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                    Speak in {selectedLanguage.split('-')[0] === 'en' ? 'English' : 
                                                    selectedLanguage.split('-')[0] === 'es' ? 'Spanish' :
                                                    selectedLanguage.split('-')[0] === 'fr' ? 'French' :
                                                    selectedLanguage.split('-')[0] === 'de' ? 'German' :
                                                    selectedLanguage.split('-')[0] === 'it' ? 'Italian' :
                                                    selectedLanguage.split('-')[0] === 'pt' ? 'Portuguese' :
                                                    selectedLanguage.split('-')[0] === 'ja' ? 'Japanese' :
                                                    selectedLanguage.split('-')[0] === 'ko' ? 'Korean' :
                                                    selectedLanguage.split('-')[0] === 'zh' ? 'Chinese' : 'selected language'}, text will be translated to English and converted to structured data
                                                </p>
                                            </div>

                                            {/* Speech Keywords Guide */}
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                                <button
                                                    onClick={() => setShowKeywordsGuide(!showKeywordsGuide)}
                                                    className={`w-full flex items-center justify-between p-3 text-left ${isModal ? 'relative z-[100072]' : ''}`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                            Speech Keywords Guide
                                                        </span>
                                                    </div>
                                                    {showKeywordsGuide ? (
                                                        <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    )}
                                                </button>
                                                {showKeywordsGuide && (
                                                    <div className="px-3 pb-3">
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                                            Speak these keywords for automatic JSON extraction:
                                                        </p>
                                                        <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                                                            <p>• <strong>Action:</strong> "reseat", "replace", "repair"</p>
                                                            <p>• <strong>Component:</strong> "motherboard", "disk", "processor", "memory"</p>
                                                            <p>• <strong>Location:</strong> "slot 1", "bay 2", "position A"</p>
                                                            <p>• <strong>Fault Code:</strong> "fault code 12345", "error 67890"</p>
                                                            <p>• <strong>Serial Number:</strong> "serial ABC123", "SN XYZ789"</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* VE Path Field */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    VE Path
                                                </label>
                                                <input
                                                    type="text"
                                                    value={voiceInputVePath}
                                                    onChange={(e) => setVoiceInputVePath(e.target.value)}
                                                    placeholder="Enter VE path..."
                                                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isModal ? 'relative z-[100072]' : ''}`}
                                                />
                                            </div>

                                            {/* Other Solution with Mic */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
                                                    Other Solution
                                                </h4>
                                                    <div className="relative w-full">
                                                        <div className="relative">
                                                            <textarea
                                                                value={otherText}
                                                                onChange={(e) => handleOtherTextChange(e.target.value)}
                                                                placeholder="Enter custom solution..."
                                                                rows={4}
                                                                className={`w-full pr-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${isModal ? 'relative z-[100072]' : ''}`}
                                                            />
                                                            <div className="absolute top-2 right-2">
                                                                <button
                                                                    onClick={isRecording ? stopRecording : startRecording}
                                                                    disabled={isTranslating}
                                                                    className={`p-2 rounded-md transition-all duration-200 ${isRecording
                                                                            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                        } disabled:bg-gray-400 disabled:cursor-not-allowed ${isModal ? 'relative z-[100073]' : ''}`}
                                                                    title={isRecording ? 'Stop recording' : 'Start recording'}
                                                                >
                                                                    {isRecording ? (
                                                                        <MicOff className="w-4 h-4" />
                                                                    ) : (
                                                                        <Mic className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>


                                                {/* Recording Status */}
                                                {isRecording && (
                                                    <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400 mt-2">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                        <span>🎤 Recording in {selectedLanguage.split('-')[0] === 'en' ? 'English' : 
                                                            selectedLanguage.split('-')[0] === 'es' ? 'Spanish' :
                                                            selectedLanguage.split('-')[0] === 'fr' ? 'French' :
                                                            selectedLanguage.split('-')[0] === 'de' ? 'German' :
                                                            selectedLanguage.split('-')[0] === 'it' ? 'Italian' :
                                                            selectedLanguage.split('-')[0] === 'pt' ? 'Portuguese' :
                                                            selectedLanguage.split('-')[0] === 'ja' ? 'Japanese' :
                                                            selectedLanguage.split('-')[0] === 'ko' ? 'Korean' :
                                                            selectedLanguage.split('-')[0] === 'zh' ? 'Chinese' : 'selected language'}... Speak now</span>
                                                        {recognizedText && (
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                Recognizing: {recognizedText}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* JSON Preview - Only show after recording stops */}
                                            {showJSONPreview && extractedKeywords && (
                                                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-2">
                                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                            <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
                                                                JSON Keywords Extracted from Speech Text
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                                                        Keywords Extracted from Azure Speech Service:<br/>
                                                        Extracted key diagnostic information from speech. Click "Apply Structured Data" to convert to JSON format.
                                                    </p>
                                                        <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm font-mono">
                                                            <div className="space-y-1">
                                                                {Object.entries(extractedKeywords).map(([key, value]) => (
                                                                    <div key={key} className="flex gap-2">
                                                                        <span className="text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap">
                                                                            {key}:
                                                                        </span>
                                                                        <span className="text-gray-900 dark:text-white break-all">
                                                                            {value}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                </div>
                                            )}

                                            {/* JSON Format Section - Only show after recording stops */}
                                            {showJSONPreview && (
                                                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-between">
                                                        <span>📋 JSON Converted Format ({isJsonEditing ? 'Editable' : 'Read-Only'})</span>
                                                        <button
                                                            onClick={() => setIsJsonEditing(!isJsonEditing)}
                                                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                            title={isJsonEditing ? "Switch to Read-Only" : "Edit JSON"}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {convertedJSON && (
                                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded p-3">
                                                                <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                                                                    ✅ JSON format generated successfully from speech keywords
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className="relative">
                                                            {/* Overlay for highlighting */}
                                                            <div
                                                                ref={jsonOverlayRef}
                                                                className="absolute inset-0 p-3 font-mono text-xs text-transparent pointer-events-none overflow-auto border border-transparent rounded-md"
                                                                aria-hidden="true"
                                                            >
                                                                {renderHighlightedJsonText()}
                                                            </div>

                                                            {/* Textarea */}
                                                            <textarea
                                                                ref={jsonTextareaRef}
                                                                value={jsonTextArea}
                                                                onChange={handleJsonTextAreaChange}
                                                                onScroll={handleJsonScroll}
                                                                readOnly={!isJsonEditing}
                                                                placeholder="JSON format will appear here after clicking 'Apply Structured Data'"
                                                                rows={12}
                                                                className={`relative w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-mono text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none z-10 ${isModal ? 'z-[100072]' : ''} ${
                                                                    !isJsonEditing 
                                                                        ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' 
                                                                        : 'bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                                                }`}
                                                            />
                                                        </div>

                                                        {jsonError && (
                                                            <div className="text-red-600 dark:text-red-400 text-xs whitespace-pre-wrap bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-2">
                                                                {jsonError}
                                                            </div>
                                                        )}

                                                        {!jsonTextArea.trim() && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-4">
                                                                JSON format will appear here after clicking "Apply Structured Data"
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={handleCancel}
                                                    className={`px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isModal ? 'relative z-[100072]' : ''}`}
                                                >
                                                    Cancel
                                                </button>
                                                {showJSONPreview && showApplyStructuredData ? (
                                                    <button
                                                        onClick={handleApplyStructuredData}
                                                        disabled={!extractedKeywords || isTranslating}
                                                        className={`flex items-center space-x-2 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium ${isModal ? 'relative z-[100072]' : ''}`}
                                                    >
                                                        <Zap className="w-4 h-4" />
                                                        <span>
                                                            {isTranslating ? 'Converting...' : 'Apply Structured Data'}
                                                        </span>
                                                    </button>
                                                ) : showJSONPreview ? (
                                                    <button
                                                        onClick={handleApply}
                                                        disabled={!isJsonValid}
                                                        className={`px-4 py-2 text-white rounded-lg transition-colors text-sm ${
                                                            isJsonValid 
                                                                ? 'bg-green-600 hover:bg-green-700' 
                                                                : 'bg-gray-400 cursor-not-allowed'
                                                        }`}
                                                        title={!isJsonValid ? 'Please fix JSON errors before applying' : ''}
                                                    >
                                                        Apply
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SolutionDropdown;