import React, { useState, useRef, useEffect } from 'react';
import { Save, Plus, Trash2, FileJson, CheckCircle2, X, Check, Upload, FileUp, Download, Eye, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface FilterProvider {
  id: string;
  type: string;
  parameters: Record<string, string>;
  loopCount?: number;
  loopParameters?: Record<string, string[]>;
}

interface NewParameter {
  key: string;
  value: string;
}

interface LoopParameter {
  key: string;
  values: string[];
}

interface Template {
  id: string;
  experiment_name: string;
  generation: string;
  filter_providers: any;
  full_payload: any;
  status: string;
  created_at: string;
  updated_at: string;
}

const CustomCRCRequest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'form' | 'templates'>('upload');
  const [uploadedJSON, setUploadedJSON] = useState('');
  const [originalJSON, setOriginalJSON] = useState('');
  const [experimentName, setExperimentName] = useState('');
  const [generation, setGeneration] = useState('Gen8');
  const [filterProviders, setFilterProviders] = useState<FilterProvider[]>([
    {
      id: '1',
      type: 'Juno.EnvironmentSelection.SubscriptionFilters.QuotaLimitFilterProvider',
      parameters: {}
    }
  ]);
  const [addingParameterFor, setAddingParameterFor] = useState<string | null>(null);
  const [newParameter, setNewParameter] = useState<NewParameter>({ key: '', value: '' });
  const [addingLoopParameterFor, setAddingLoopParameterFor] = useState<string | null>(null);
  const [newLoopParameter, setNewLoopParameter] = useState<LoopParameter>({ key: '', values: [''] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [editorView, setEditorView] = useState<'edit' | 'tree'>('edit');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedTemplateJSON, setEditedTemplateJSON] = useState('');
  const [originalTemplateJSON, setOriginalTemplateJSON] = useState('');
  const [formTemplateFile, setFormTemplateFile] = useState<File | null>(null);
  const [originalFormState, setOriginalFormState] = useState<{
    experimentName: string;
    generation: string;
    filterProviders: FilterProvider[];
  } | null>(null);
  const [deletedParameters, setDeletedParameters] = useState<Record<string, Set<string>>>({});
  const [fullOriginalTemplate, setFullOriginalTemplate] = useState<any>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formFileInputRef = useRef<HTMLInputElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const editPreRef = useRef<HTMLPreElement>(null);

  const handleTextareaScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const filterTypeOptions = [
    'Juno.Scheduler.Preconditions.TimerTriggerProvider',
    'Juno.Scheduler.Preconditions.InProgressExperimentsProvider',
    'Juno.Scheduler.Actions.SpanNodePoolExperimentsProvider',
    'Juno.Scheduler.Preconditions.FailureRatePreconditionProvider',
    'Juno.Scheduler.Actions.JunoExecutionGoalDisableProvider',
    'Juno.Execution.Providers.Environment.EnvironmentSelectionProvider',
    'Juno.Execution.Providers.Environment.TipCreationProvider',
    'Microsoft.Azure.CRC.Execution.Providers.LoopExecutionProvider',
    'Juno.EnvironmentSelection.SubscriptionFilters.QuotaLimitFilterProvider',
    'Juno.EnvironmentSelection.ClusterSelectionFilters.RegionFilterProvider',
    'Juno.EnvironmentSelection.NodeSelectionFilters.MachinePoolFilterProvider',
    'Juno.EnvironmentSelection.ClusterSelectionFilters.VmSkuFilterProvider',
    'Juno.EnvironmentSelection.ClusterSelectionFilters.ClusterTypeFilterProvider',
    'Juno.EnvironmentSelection.NodeSelectionFilters.ClusterFilterProvider',
    'Juno.EnvironmentSelection.NodeSelectionFilters.NodeStatusFilterProvider',
    'Juno.EnvironmentSelection.NodeSelectionFilters.NodeGenerationFilterProvider',
    'Juno.EnvironmentSelection.NodeSelectionFilters.EmptyNodeProvider',
    'Juno.EnvironmentSelection.NodeSelectionFilters.SystemArchitectureFilterProvider',
    'Juno.EnvironmentSelection.ClusterSelectionFilters.ClusterStageFilterProvider',
    'Juno.EnvironmentSelection.NodeSelectionFilters.NodeFilterProvider'
  ];

  const showAlert = (type: 'success' | 'error' | 'warning', message: string) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from('custom_crc_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        showAlert('error', 'Failed to load templates');
        console.error('Error fetching templates:', error);
      } else {
        setTemplates(data || []);
      }
    } catch (error) {
      showAlert('error', 'Failed to load templates');
      console.error('Error fetching templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    }
  }, [activeTab]);

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowViewModal(true);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    const jsonString = JSON.stringify(template.full_payload, null, 2);
    setEditedTemplateJSON(jsonString);
    setOriginalTemplateJSON(jsonString);
    setShowEditModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const parsedJSON = JSON.parse(editedTemplateJSON);
      const { error } = await supabase
        .from('custom_crc_requests')
        .update({
          full_payload: parsedJSON,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTemplate.id);

      if (error) {
        showAlert('error', 'Failed to save template');
        console.error('Error saving template:', error);
      } else {
        showAlert('success', 'Template saved successfully');
        setShowEditModal(false);
        fetchTemplates();
      }
    } catch (error) {
      showAlert('error', 'Invalid JSON format');
      console.error('Error parsing JSON:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('custom_crc_requests')
        .delete()
        .eq('id', templateId);

      if (error) {
        showAlert('error', 'Failed to delete template');
        console.error('Error deleting template:', error);
      } else {
        showAlert('success', 'Template deleted successfully');
        fetchTemplates();
      }
    } catch (error) {
      showAlert('error', 'Failed to delete template');
      console.error('Error deleting template:', error);
    }
  };

  const handleEditTextareaScroll = () => {
    if (editTextareaRef.current && editPreRef.current) {
      editPreRef.current.scrollTop = editTextareaRef.current.scrollTop;
      editPreRef.current.scrollLeft = editTextareaRef.current.scrollLeft;
    }
  };

  const renderEditedJSONWithHighlights = () => {
    if (!editedTemplateJSON) return null;

    try {
      const parsed = JSON.parse(editedTemplateJSON);
      const formatted = JSON.stringify(parsed, null, 2);
      const lines = formatted.split('\n');

      if (!originalTemplateJSON) {
        return lines.map((line, index) => <div key={index}>{line}</div>);
      }

      const originalParsed = JSON.parse(originalTemplateJSON);
      const changes = detectJSONChangeType(originalParsed, parsed);

      return lines.map((line, index) => {
        const trimmedLine = line.trim();
        let bgColor = '';
        let borderColor = '';

        // Check if this line contains a changed key
        Object.entries(changes).forEach(([key, changeType]) => {
          if (trimmedLine.includes(`"${key}"`)) {
            if (changeType === 'new') {
              bgColor = 'bg-green-100 dark:bg-green-900/30';
              borderColor = 'border-l-4 border-green-500 pl-2';
            } else if (changeType === 'modified') {
              bgColor = 'bg-yellow-100 dark:bg-yellow-900/30';
              borderColor = 'border-l-4 border-yellow-500 pl-2';
            } else if (changeType === 'deleted') {
              bgColor = 'bg-red-100 dark:bg-red-900/30';
              borderColor = 'border-l-4 border-red-500 pl-2';
            }
          }
        });

        return (
          <div
            key={index}
            className={`${bgColor} ${borderColor}`}
          >
            {line}
          </div>
        );
      });
    } catch (error) {
      return <div className="text-red-600 dark:text-red-400">Invalid JSON format</div>;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        JSON.parse(content);
        setUploadedJSON(content);
        setOriginalJSON(content);
        showAlert('success', 'JSON file uploaded successfully!');
      } catch (error) {
        showAlert('error', 'Invalid JSON file. Please upload a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleFormTemplateUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        // Store the full original template to preserve workflow and other fields
        setFullOriginalTemplate(parsedData);

        if (parsedData.definition) {
          const definition = parsedData.definition;

          if (definition.experimentName) {
            setExperimentName(definition.experimentName);
          }

          if (definition.metadata?.generation) {
            setGeneration(definition.metadata.generation);
          }

          const extractedProviders: FilterProvider[] = [];

          if (definition.targetGoals && definition.targetGoals.length > 0) {
            const targetGoal = definition.targetGoals[0];

            if (targetGoal.preconditions) {
              targetGoal.preconditions.forEach((precondition: any) => {
                if (precondition.type && precondition.parameters) {
                  extractedProviders.push({
                    id: Date.now().toString() + Math.random(),
                    type: precondition.type,
                    parameters: precondition.parameters || {},
                    loopCount: precondition.loopCount,
                    loopParameters: precondition.loopParameters
                  });
                }
              });
            }

            if (targetGoal.actions) {
              targetGoal.actions.forEach((action: any) => {
                if (action.type && action.parameters) {
                  const params = { ...action.parameters };
                  delete params.environmentQuery;

                  extractedProviders.push({
                    id: Date.now().toString() + Math.random(),
                    type: action.type,
                    parameters: params || {}
                  });

                  if (action.parameters?.environmentQuery?.definition?.filters) {
                    const filters = action.parameters.environmentQuery.definition.filters;
                    filters.forEach((filter: any) => {
                      extractedProviders.push({
                        id: Date.now().toString() + Math.random(),
                        type: filter.type,
                        parameters: filter.parameters || {},
                        loopCount: filter.loopCount,
                        loopParameters: filter.loopParameters
                      });
                    });
                  }
                }
              });
            }
          }

          if (definition.controlGoals && definition.controlGoals.length > 0) {
            const controlGoal = definition.controlGoals[0];

            if (controlGoal.preconditions) {
              controlGoal.preconditions.forEach((precondition: any) => {
                if (precondition.type && precondition.parameters) {
                  extractedProviders.push({
                    id: Date.now().toString() + Math.random(),
                    type: precondition.type,
                    parameters: precondition.parameters || {}
                  });
                }
              });
            }

            if (controlGoal.actions) {
              controlGoal.actions.forEach((action: any) => {
                if (action.type && action.parameters) {
                  extractedProviders.push({
                    id: Date.now().toString() + Math.random(),
                    type: action.type,
                    parameters: action.parameters || {}
                  });
                }
              });
            }
          }

          if (extractedProviders.length > 0) {
            setFilterProviders(extractedProviders);
          }

          // Save original state for change tracking
          setOriginalFormState({
            experimentName: definition.experimentName || '',
            generation: definition.metadata?.generation || 'Gen8',
            filterProviders: JSON.parse(JSON.stringify(extractedProviders))
          });

          setFormTemplateFile(file);
          setDeletedParameters({});
          showAlert('success', 'Template loaded successfully! Form fields have been pre-filled.');
        } else {
          showAlert('error', 'Invalid template structure. Expected a definition object.');
        }
      } catch (error) {
        console.error('Error parsing template:', error);
        showAlert('error', 'Invalid JSON file. Please upload a valid template file.');
      }
    };
    reader.readAsText(file);
  };

  const clearFormTemplate = () => {
    setFormTemplateFile(null);
    setExperimentName('');
    setGeneration('Gen8');
    setFilterProviders([
      {
        id: '1',
        type: filterTypeOptions[0],
        parameters: {}
      }
    ]);
    setOriginalFormState(null);
    setDeletedParameters({});
    setFullOriginalTemplate(null);
    if (formFileInputRef.current) {
      formFileInputRef.current.value = '';
    }
    showAlert('success', 'Form cleared successfully!');
  };

  const handleDownloadJSON = () => {
    try {
      const jsonToDownload = activeTab === 'upload'
        ? uploadedJSON
        : JSON.stringify(generateFullPayload(), null, 2);

      const blob = new Blob([jsonToDownload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `custom-crc-request-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showAlert('success', 'JSON file downloaded successfully!');
    } catch (error) {
      showAlert('error', 'Failed to download JSON file.');
    }
  };

  const addFilterProvider = () => {
    setFilterProviders([
      ...filterProviders,
      {
        id: Date.now().toString(),
        type: filterTypeOptions[0],
        parameters: {}
      }
    ]);
  };

  const removeFilterProvider = (id: string) => {
    setFilterProviders(filterProviders.filter(fp => fp.id !== id));
  };

  const updateFilterType = (id: string, type: string) => {
    setFilterProviders(
      filterProviders.map(fp => {
        if (fp.id === id) {
          const isLoopProvider = type === 'Microsoft.Azure.CRC.Execution.Providers.LoopExecutionProvider';
          return {
            ...fp,
            type,
            loopCount: isLoopProvider ? 3 : undefined,
            loopParameters: isLoopProvider ? {} : undefined
          };
        }
        return fp;
      })
    );
  };

  const updateFilterParameter = (id: string, key: string, value: string) => {
    setFilterProviders(
      filterProviders.map(fp =>
        fp.id === id
          ? { ...fp, parameters: { ...fp.parameters, [key]: value } }
          : fp
      )
    );
  };

  const updateLoopCount = (id: string, count: number) => {
    setFilterProviders(
      filterProviders.map(fp =>
        fp.id === id ? { ...fp, loopCount: count } : fp
      )
    );
  };

  const startAddingParameter = (id: string) => {
    setAddingParameterFor(id);
    setNewParameter({ key: '', value: '' });
  };

  const cancelAddingParameter = () => {
    setAddingParameterFor(null);
    setNewParameter({ key: '', value: '' });
  };

  const saveNewParameter = (id: string) => {
    if (newParameter.key.trim()) {
      updateFilterParameter(id, newParameter.key.trim(), newParameter.value);
      setAddingParameterFor(null);
      setNewParameter({ key: '', value: '' });
    }
  };

  const startAddingLoopParameter = (id: string) => {
    setAddingLoopParameterFor(id);
    setNewLoopParameter({ key: '', values: [''] });
  };

  const cancelAddingLoopParameter = () => {
    setAddingLoopParameterFor(null);
    setNewLoopParameter({ key: '', values: [''] });
  };

  const saveNewLoopParameter = (id: string) => {
    if (newLoopParameter.key.trim()) {
      setFilterProviders(
        filterProviders.map(fp => {
          if (fp.id === id) {
            return {
              ...fp,
              loopParameters: {
                ...fp.loopParameters,
                [newLoopParameter.key.trim()]: newLoopParameter.values.filter(v => v.trim())
              }
            };
          }
          return fp;
        })
      );
      setAddingLoopParameterFor(null);
      setNewLoopParameter({ key: '', values: [''] });
    }
  };

  const updateLoopParameterValue = (index: number, value: string) => {
    const newValues = [...newLoopParameter.values];
    newValues[index] = value;
    setNewLoopParameter({ ...newLoopParameter, values: newValues });
  };

  const addLoopParameterValue = () => {
    setNewLoopParameter({
      ...newLoopParameter,
      values: [...newLoopParameter.values, '']
    });
  };

  const removeLoopParameterValue = (index: number) => {
    setNewLoopParameter({
      ...newLoopParameter,
      values: newLoopParameter.values.filter((_, i) => i !== index)
    });
  };

  const removeLoopParameter = (id: string, key: string) => {
    setFilterProviders(
      filterProviders.map(fp => {
        if (fp.id === id && fp.loopParameters) {
          const newLoopParams = { ...fp.loopParameters };
          delete newLoopParams[key];
          return { ...fp, loopParameters: newLoopParams };
        }
        return fp;
      })
    );
  };

  const removeParameter = (id: string, key: string) => {
    // Track deleted parameters instead of removing them
    setDeletedParameters(prev => {
      const newDeleted = { ...prev };
      if (!newDeleted[id]) {
        newDeleted[id] = new Set();
      }
      newDeleted[id].add(key);
      return newDeleted;
    });
  };

  const restoreParameter = (id: string, key: string) => {
    setDeletedParameters(prev => {
      const newDeleted = { ...prev };
      if (newDeleted[id]) {
        newDeleted[id].delete(key);
        if (newDeleted[id].size === 0) {
          delete newDeleted[id];
        }
      }
      return newDeleted;
    });
  };

  const getParameterChangeType = (providerId: string, key: string, value: string): 'new' | 'modified' | 'deleted' | 'unchanged' => {
    if (deletedParameters[providerId]?.has(key)) {
      return 'deleted';
    }

    if (!originalFormState) {
      return 'unchanged';
    }

    const originalProvider = originalFormState.filterProviders.find(fp => fp.id === providerId);
    if (!originalProvider) {
      return 'new';
    }

    if (!(key in originalProvider.parameters)) {
      return 'new';
    }

    if (originalProvider.parameters[key] !== value) {
      return 'modified';
    }

    return 'unchanged';
  };

  const getCleanedParameters = (providerId: string, parameters: Record<string, string>) => {
    const cleaned: Record<string, string> = {};
    Object.entries(parameters).forEach(([key, value]) => {
      // Exclude deleted parameters
      if (!deletedParameters[providerId]?.has(key)) {
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

  const generateFullPayload = () => {
    // If we have a full original template, merge form values into it and preserve workflow
    if (fullOriginalTemplate) {
      const updatedTemplate = JSON.parse(JSON.stringify(fullOriginalTemplate));

      // Build a map of provider types to their parameters from the form
      // Group by type and collect all parameters for each type
      const providerParamsMap = new Map<string, Record<string, string>[]>();
      filterProviders.forEach(fp => {
        const cleanedParams = getCleanedParameters(fp.id, fp.parameters);
        if (!providerParamsMap.has(fp.type)) {
          providerParamsMap.set(fp.type, []);
        }
        providerParamsMap.get(fp.type)!.push(cleanedParams);
      });

      // Helper to merge parameters while preserving key order
      const mergeParametersPreservingOrder = (original: any, updates: any) => {
        // Update existing keys in place
        Object.keys(original).forEach(key => {
          if (key in updates) {
            original[key] = updates[key];
          }
        });
        // Add new keys at the end
        Object.keys(updates).forEach(key => {
          if (!(key in original)) {
            original[key] = updates[key];
          }
        });
        return original;
      };

      // Helper to get next parameter set for a provider type
      const providerIndices = new Map<string, number>();
      const getNextParamsForType = (type: string) => {
        const params = providerParamsMap.get(type);
        if (!params || params.length === 0) return null;

        const currentIndex = providerIndices.get(type) || 0;
        const result = params[currentIndex % params.length];
        providerIndices.set(type, currentIndex + 1);
        return result;
      };

      // Update the editable fields
      if (updatedTemplate.definition) {
        updatedTemplate.definition.experimentName = experimentName || updatedTemplate.definition.experimentName;

        if (updatedTemplate.definition.metadata) {
          updatedTemplate.definition.metadata.generation = generation;
        }

        // Update filter providers in targetGoals
        if (updatedTemplate.definition.targetGoals && updatedTemplate.definition.targetGoals.length > 0) {
          const targetGoal = updatedTemplate.definition.targetGoals[0];

          // Update preconditions
          if (targetGoal.preconditions) {
            targetGoal.preconditions.forEach((precondition: any) => {
              const formParams = getNextParamsForType(precondition.type);
              if (formParams && Object.keys(formParams).length > 0) {
                const matchingProvider = filterProviders.find(fp => fp.type === precondition.type);
                mergeParametersPreservingOrder(precondition.parameters, formParams);
                if (matchingProvider?.loopCount !== undefined) {
                  precondition.loopCount = matchingProvider.loopCount;
                }
                if (matchingProvider?.loopParameters !== undefined) {
                  precondition.loopParameters = matchingProvider.loopParameters;
                }
              }
            });
          }

          // Reset indices for actions
          providerIndices.clear();

          // Update actions
          if (targetGoal.actions) {
            targetGoal.actions.forEach((action: any) => {
              const formParams = getNextParamsForType(action.type);
              if (formParams && Object.keys(formParams).length > 0) {
                mergeParametersPreservingOrder(action.parameters, formParams);
              }

              // Update filters in environmentQuery if they exist
              if (action.parameters?.environmentQuery?.definition?.filters) {
                action.parameters.environmentQuery.definition.filters.forEach((filter: any) => {
                  const filterParams = getNextParamsForType(filter.type);
                  if (filterParams && Object.keys(filterParams).length > 0) {
                    const matchingProvider = filterProviders.find(fp => fp.type === filter.type);
                    mergeParametersPreservingOrder(filter.parameters, filterParams);
                    if (matchingProvider?.loopCount !== undefined) {
                      filter.loopCount = matchingProvider.loopCount;
                    }
                    if (matchingProvider?.loopParameters !== undefined) {
                      filter.loopParameters = matchingProvider.loopParameters;
                    }
                  }
                });
              }
            });
          }
        }
      }

      return updatedTemplate;
    }

    // Fallback to default template generation if no original template
    const timestamp = new Date().toISOString();
    const expName = experimentName || 'Probation_Flight_Gen8_CRC_v11';
    const genNumber = generation.replace('Gen', '');

    const findProviderByType = (type: string) => {
      return filterProviders.find(fp => fp.type === type);
    };

    const mergeProviderParameters = (defaultParams: Record<string, unknown>, type: string) => {
      const customProvider = findProviderByType(type);
      if (customProvider) {
        const cleanedParams = getCleanedParameters(customProvider.id, customProvider.parameters);
        return { ...defaultParams, ...cleanedParams };
      }
      return defaultParams;
    };

    const getProviderWithParams = (type: string, defaultParams: Record<string, unknown> = {}) => {
      const customProvider = findProviderByType(type);
      const cleanedParams = customProvider ? getCleanedParameters(customProvider.id, customProvider.parameters) : {};
      const provider: Record<string, unknown> = {
        type,
        parameters: customProvider ? { ...defaultParams, ...cleanedParams } : defaultParams
      };

      if (type === 'Microsoft.Azure.CRC.Execution.Providers.LoopExecutionProvider' && customProvider) {
        provider.loopCount = customProvider.loopCount || 3;
        provider.loopParameters = customProvider.loopParameters || {};
      }

      return provider;
    };

    const knownProviderTypes = [
      'Juno.Scheduler.Preconditions.TimerTriggerProvider',
      'Juno.Scheduler.Preconditions.InProgressExperimentsProvider',
      'Juno.Scheduler.Actions.SpanNodePoolExperimentsProvider',
      'Juno.Scheduler.Preconditions.FailureRatePreconditionProvider',
      'Juno.Scheduler.Actions.JunoExecutionGoalDisableProvider'
    ];

    const filters = filterProviders
      .filter(fp => !knownProviderTypes.includes(fp.type))
      .map(fp => {
        const cleanedParams = getCleanedParameters(fp.id, fp.parameters);
        const filter: Record<string, unknown> = {
          type: fp.type,
          parameters: cleanedParams
        };

        if (fp.type === 'Microsoft.Azure.CRC.Execution.Providers.LoopExecutionProvider') {
          filter.loopCount = fp.loopCount || 3;
          filter.loopParameters = fp.loopParameters || {};
        }

        return filter;
      });

    return {
      id: `${expName}.ExecutionGoal.json`,
      created: timestamp,
      lastModified: timestamp,
      definition: {
        experimentName: expName,
        description: `Execution Goal to Stress ${generation} Nodes in Probation`,
        parameters: {
          'experiment.name': expName,
          generation: generation,
          nodeCpuId: 'N/A',
          revision: 'v2',
          nodeAffinity: 'SameRack',
          workloadVersion: '1.16.3008.1689',
          haPFServicePath: 'CloudVault://3af0ca8a-5c15-4f16-b25e-fc19c3c4dbd2\\deployment\\JunoHostAgent\\win-x64\\PPE01\\App',
          gaVersion: '6.1.2759.1571',
          vcVersion: '1.16.3008.1689',
          vcTimeoutMinStepsSucceeded: 1,
          vcDuration: '00.01:00:00',
          vcTimeout: '00.05:30:00'
        },
        metadata: {
          teamName: 'Probation - Fleet Engineering',
          experimentCategory: 'AB',
          generation: generation,
          revision: 'v2',
          payloadType: 'HW',
          owner: 'dapinsingh@microsoft.com',
          templateOwner: 'dapinsingh@microsoft.com',
          version: '2021-01-01',
          tenantId: '72f988bf-86f1-41af-91ab-2d7cd011db47',
          nodeCpuId: 'N/A',
          experimentType: 'ProbationRecovery',
          payload: 'N/A',
          payloadVersion: 'N/A',
          payloadPFVersion: 'N/A',
          workloadType: 'VirtualClient',
          impactType: 'None',
          lastUpdatedBy: 'dapinsingh@microsoft.com'
        },
        targetGoals: [
          {
            name: `Probation-Flight-${generation}-linux-x64`,
            enabled: true,
            preconditions: [
              getProviderWithParams('Juno.Scheduler.Preconditions.TimerTriggerProvider', {
                cronExpression: '*/30 * * * *'
              }),
              getProviderWithParams('Juno.Scheduler.Preconditions.InProgressExperimentsProvider', {
                targetExperimentInstances: 200
              })
            ],
            actions: [
              {
                type: 'Juno.Scheduler.Actions.SpanNodePoolExperimentsProvider',
                parameters: {
                  ...mergeProviderParameters({
                    considerExperimentStatuses: 'Succeeded',
                    platform: 'x64',
                    nodeIds: 'placeholder',
                    subscriptionId: '87abbcb4-09bf-4160-a47b-851b9069b4db',
                    tipSessionsRequired: '1',
                    includeHealthGrade: 'Amber,Green',
                    includeLifecycleState: 'Production',
                    includeAvailabilityState: 'Probation',
                    includeGeneration: parseInt(genNumber),
                    vmCoreCount: 2,
                    workload: 'PERF-CPU-COREMARK',
                    requiredInstances: 2,
                    gaVersion: '6.1.2759.1571',
                    lookBack: '07.00:00:00',
                    batchSize: 50,
                    nodeRedundancy: 1
                  }, 'Juno.Scheduler.Actions.SpanNodePoolExperimentsProvider'),
                  environmentQuery: {
                    parameterType: 'Juno.Contracts.EnvironmentQuery',
                    definition: {
                      name: 'EnvironmentQuery',
                      nodeCount: 999999,
                      nodeAffinity: 'Any',
                      groupCount: 1,
                      filters: filters,
                      parameters: {}
                    }
                  }
                }
              }
            ]
          }
        ],
        controlGoals: [
          {
            name: 'executionGoalOFR',
            preconditions: [
              getProviderWithParams('Juno.Scheduler.Preconditions.FailureRatePreconditionProvider', {
                minimumExperimentInstance: 20,
                targetFailureRate: 101,
                daysAgo: 7
              })
            ],
            actions: [
              getProviderWithParams('Juno.Scheduler.Actions.JunoExecutionGoalDisableProvider', {})
            ]
          }
        ],
        experiment: {
          $schema: 'https://junoprod01frontdoor.azurewebsites.net',
          contentVersion: '1.0.0',
          name: '$.parameters.experiment.name',
          description: 'Probation CRC tests.',
          metadata: {
            workload: '$.parameters.workload',
            workloadVersion: '$.parameters.workloadVersion'
          },
          parameters: {},
          workflow: []
        }
      }
    };
  };


  const TreeNode: React.FC<{ nodeKey: string; value: any; level: number; isChanged: boolean }> = ({
    nodeKey,
    value,
    level,
    isChanged
  }) => {
    const indent = level * 24;
    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    const isArray = Array.isArray(value);
    const [isExpanded, setIsExpanded] = useState(true);

    if (isObject || isArray) {
      const entries = isArray ? value.map((v: any, i: number) => [i.toString(), v]) : Object.entries(value);
      const isEmpty = entries.length === 0;

      return (
        <div style={{ marginLeft: `${indent}px` }}>
          <div
            className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
              isChanged ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''
            }`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="text-gray-500 dark:text-gray-400 select-none">
              {isEmpty ? '▪' : isExpanded ? '▼' : '▶'}
            </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{nodeKey}</span>
            <span className="text-gray-500 dark:text-gray-400">
              {isArray ? `[${entries.length}]` : `{${entries.length}}`}
            </span>
          </div>
          {isExpanded && !isEmpty && (
            <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-2">
              {entries.map(([k, v]: [string, any]) => (
                <TreeNode key={k} nodeKey={k} value={v} level={level + 1} isChanged={false} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        style={{ marginLeft: `${indent}px` }}
        className={`flex items-center gap-2 py-1 px-2 rounded ${
          isChanged ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''
        }`}
      >
        <span className="text-gray-500 dark:text-gray-400 select-none">▪</span>
        <span className="font-semibold text-purple-600 dark:text-purple-400">{nodeKey}:</span>
        <span className={`${
          typeof value === 'string'
            ? 'text-green-600 dark:text-green-400'
            : typeof value === 'number'
            ? 'text-orange-600 dark:text-orange-400'
            : typeof value === 'boolean'
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {typeof value === 'string' ? `"${value}"` : String(value)}
        </span>
      </div>
    );
  };

  const renderTreeView = () => {
    if (!uploadedJSON) return null;

    try {
      const parsed = JSON.parse(uploadedJSON);
      const entries = Array.isArray(parsed)
        ? parsed.map((v: any, i: number) => [i.toString(), v])
        : Object.entries(parsed);

      return (
        <div className="text-sm">
          {entries.map(([key, value]: [string, any]) => (
            <TreeNode key={key} nodeKey={key} value={value} level={0} isChanged={false} />
          ))}
        </div>
      );
    } catch (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-600 dark:text-red-400 font-semibold">
          Invalid JSON
        </div>
      );
    }
  };

  const detectJSONChangeType = (original: any, current: any, path: string[] = []): Record<string, 'new' | 'modified' | 'deleted'> => {
    const changes: Record<string, 'new' | 'modified' | 'deleted'> = {};

    if (!original || typeof original !== 'object') {
      return changes;
    }

    // Check for deleted and modified keys
    Object.keys(original).forEach(key => {
      const currentPath = [...path, key].join('.');
      if (!(key in current)) {
        changes[key] = 'deleted';
      } else if (typeof original[key] === 'object' && typeof current[key] === 'object') {
        const nestedChanges = detectJSONChangeType(original[key], current[key], [...path, key]);
        Object.assign(changes, nestedChanges);
      } else if (original[key] !== current[key]) {
        changes[key] = 'modified';
      }
    });

    // Check for new keys
    Object.keys(current).forEach(key => {
      if (!(key in original)) {
        changes[key] = 'new';
      }
    });

    return changes;
  };

  const renderUploadedJSONWithHighlights = () => {
    if (!uploadedJSON) return null;

    try {
      const parsed = JSON.parse(uploadedJSON);
      const formatted = JSON.stringify(parsed, null, 2);
      const lines = formatted.split('\n');

      if (!originalJSON) {
        return lines.map((line, index) => <div key={index}>{line}</div>);
      }

      const originalParsed = JSON.parse(originalJSON);
      const changes = detectJSONChangeType(originalParsed, parsed);

      return lines.map((line, index) => {
        const trimmedLine = line.trim();
        let bgColor = '';
        let borderColor = '';

        // Check if this line contains a changed key
        Object.entries(changes).forEach(([key, changeType]) => {
          if (trimmedLine.includes(`"${key}"`)) {
            if (changeType === 'new') {
              bgColor = 'bg-green-100 dark:bg-green-900/30';
              borderColor = 'border-l-4 border-green-500 pl-2';
            } else if (changeType === 'modified') {
              bgColor = 'bg-yellow-100 dark:bg-yellow-900/30';
              borderColor = 'border-l-4 border-yellow-500 pl-2';
            } else if (changeType === 'deleted') {
              bgColor = 'bg-red-100 dark:bg-red-900/30';
              borderColor = 'border-l-4 border-red-500 pl-2';
            }
          }
        });

        return (
          <div
            key={index}
            className={`${bgColor} ${borderColor}`}
          >
            {line}
          </div>
        );
      });
    } catch (error) {
      return <div className="text-red-600 dark:text-red-400">Invalid JSON format</div>;
    }
  };

  const renderHighlightedJSON = () => {
    const payload = generateFullPayload();
    const jsonString = JSON.stringify(payload, null, 2);
    const lines = jsonString.split('\n');

    if (!originalFormState || !fullOriginalTemplate) {
      // If no template was loaded, just show the JSON without highlights
      return lines.map((line, index) => (
        <div key={index}>{line}</div>
      ));
    }

    // Compare the generated payload with the original template
    const changes = detectJSONChangeType(fullOriginalTemplate, payload);

    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      let bgColor = '';
      let borderColor = '';

      // Check if this line contains a changed key
      Object.entries(changes).forEach(([key, changeType]) => {
        if (trimmedLine.includes(`"${key}"`)) {
          if (changeType === 'new') {
            bgColor = 'bg-green-100 dark:bg-green-900/30';
            borderColor = 'border-l-4 border-green-500 pl-2';
          } else if (changeType === 'modified') {
            bgColor = 'bg-yellow-100 dark:bg-yellow-900/30';
            borderColor = 'border-l-4 border-yellow-500 pl-2';
          } else if (changeType === 'deleted') {
            bgColor = 'bg-red-100 dark:bg-red-900/30';
            borderColor = 'border-l-4 border-red-500 pl-2';
          }
        }
      });

      return (
        <div
          key={index}
          className={`${bgColor} ${borderColor}`}
        >
          {line}
        </div>
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!experimentName.trim()) {
      showAlert('error', 'Please enter an experiment name');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullPayload = generateFullPayload();
      const filterProvidersData = filterProviders.reduce((acc, fp) => {
        acc[fp.type] = fp.parameters;
        return acc;
      }, {} as Record<string, Record<string, string>>);

      const { error } = await supabase
        .from('custom_crc_requests')
        .insert({
          experiment_name: experimentName,
          generation: generation,
          filter_providers: filterProvidersData,
          full_payload: fullPayload,
          created_by: 'user',
          status: 'submitted',
          submitted_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      showAlert('success', 'Custom CRC request submitted successfully!');
      setExperimentName('');
      setGeneration('Gen8');
      setFilterProviders([
        {
          id: '1',
          type: filterTypeOptions[0],
          parameters: {}
        }
      ]);
    } catch (error) {
      console.error('Error submitting request:', error);
      showAlert('error', 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <FileJson className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custom CRC Request</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create a custom CRC execution goal based on template</p>
          </div>
        </div>

        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload File
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'form'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                Form Builder
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'templates'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                My Templates
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'upload' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Upload JSON Template
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                  <FileUp className="w-5 h-5" />
                  <span className="font-medium">Choose File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {uploadedJSON && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    File loaded successfully
                  </span>
                )}
              </div>
            </div>

            {uploadedJSON && (
              <>
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      View:
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditorView('edit')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          editorView === 'edit'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        Edit JSON
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorView('tree')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          editorView === 'tree'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        Tree View
                      </button>
                    </div>
                  </div>

                  {editorView === 'edit' ? (
                    <div className="relative w-full h-96 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white dark:bg-gray-900">
                      <pre ref={preRef} className="absolute inset-0 w-full h-full px-4 py-3 font-mono text-sm overflow-auto pointer-events-none whitespace-pre-wrap break-words z-0 text-gray-900 dark:text-white">
                        {renderUploadedJSONWithHighlights()}
                      </pre>
                      <textarea
                        ref={textareaRef}
                        value={uploadedJSON}
                        onChange={(e) => setUploadedJSON(e.target.value)}
                        onScroll={handleTextareaScroll}
                        className="absolute inset-0 w-full h-full px-4 py-3 font-mono text-sm resize-none outline-none z-10"
                        placeholder="Upload a JSON file or paste your JSON here"
                        spellCheck={false}
                        style={{
                          backgroundColor: 'transparent',
                          color: 'transparent',
                          caretColor: 'rgb(59, 130, 246)'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-96 border border-gray-300 dark:border-gray-600 rounded-lg overflow-auto bg-gray-50 dark:bg-gray-900 p-4">
                      {renderTreeView()}
                    </div>
                  )}

                  {editorView === 'edit' && originalJSON && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                        Change Tracking Active:
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded"></div>
                          <span className="text-gray-700 dark:text-gray-300">New parameters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-500 rounded"></div>
                          <span className="text-gray-700 dark:text-gray-300">Modified values</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded"></div>
                          <span className="text-gray-700 dark:text-gray-300">Deleted parameters</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {editorView === 'tree' && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Click on nodes to expand or collapse them
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <FileJson className="w-5 h-5" />
                    Preview JSON
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadJSON}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-5 h-5" />
                    Download JSON
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const parsedJSON = JSON.parse(uploadedJSON);
                        setIsSubmitting(true);

                        const experimentName = parsedJSON?.definition?.experimentName || parsedJSON?.experimentName || parsedJSON?.name || 'Uploaded Template';
                        const generation = parsedJSON?.definition?.metadata?.generation || parsedJSON?.generation || 'Gen8';

                        const { error } = await supabase
                          .from('custom_crc_requests')
                          .insert({
                            experiment_name: experimentName,
                            generation: generation,
                            filter_providers: {},
                            full_payload: parsedJSON,
                            created_by: 'user',
                            status: 'submitted',
                            submitted_at: new Date().toISOString()
                          });

                        if (error) {
                          throw error;
                        }

                        showAlert('success', 'Custom CRC request submitted successfully!');
                        setUploadedJSON('');
                        setOriginalJSON('');
                        setIsSubmitting(false);
                      } catch (error) {
                        console.error('Error submitting:', error);
                        showAlert('error', 'Failed to submit. Please check the JSON and try again.');
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : activeTab === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Upload Template (Optional)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload an existing template to pre-fill all form fields. You can then modify the values as needed.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors font-medium">
                <FileUp className="w-5 h-5" />
                <span>Choose Template File</span>
                <input
                  ref={formFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFormTemplateUpload}
                  className="hidden"
                />
              </label>
              {formTemplateFile && (
                <>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {formTemplateFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={clearFormTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors font-medium"
                  >
                    <X className="w-4 h-4" />
                    Clear Template
                  </button>
                </>
              )}
            </div>

            {originalFormState && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                  Change Tracking Active:
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">New</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-500 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">Modified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded"></div>
                    <span className="text-gray-700 dark:text-gray-300">Deleted (click ✓ to restore)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Experiment Name *
              </label>
              <input
                type="text"
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="e.g., Probation_Flight_Gen8_CRC_v11"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Generation *
              </label>
              <select
                value={generation}
                onChange={(e) => setGeneration(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                required
              >
                <option value="Gen6">Gen6</option>
                <option value="Gen7">Gen7</option>
                <option value="Gen8">Gen8</option>
                <option value="Gen9">Gen9</option>
                <option value="Gen10">Gen10</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Providers</h2>
              <button
                type="button"
                onClick={addFilterProvider}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Provider
              </button>
            </div>

            <div className="space-y-4">
              {filterProviders.map((filter, index) => {
                const isLoopProvider = filter.type === 'Microsoft.Azure.CRC.Execution.Providers.LoopExecutionProvider';

                return (
                  <div
                    key={filter.id}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Provider Type {index + 1}
                        </label>
                        <select
                          value={filter.type}
                          onChange={(e) => updateFilterType(filter.id, e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white"
                        >
                          {filterTypeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option.split('.').pop()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFilterProvider(filter.id)}
                        className="mt-8 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove provider"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {isLoopProvider && (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Loop Count
                          </label>
                          <input
                            type="number"
                            value={filter.loopCount || 3}
                            onChange={(e) => updateLoopCount(filter.id, parseInt(e.target.value))}
                            min="1"
                            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Loop Parameters
                            </label>
                            {addingLoopParameterFor !== filter.id && (
                              <button
                                type="button"
                                onClick={() => startAddingLoopParameter(filter.id)}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                              >
                                <Plus className="w-4 h-4" />
                                Add Loop Parameter
                              </button>
                            )}
                          </div>

                          {addingLoopParameterFor === filter.id && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
                              <input
                                type="text"
                                value={newLoopParameter.key}
                                onChange={(e) => setNewLoopParameter({ ...newLoopParameter, key: e.target.value })}
                                placeholder="Parameter Key (e.g., workload)"
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                                autoFocus
                              />
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  Array Values (must match loop count: {filter.loopCount || 3})
                                </label>
                                {newLoopParameter.values.map((value, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={value}
                                      onChange={(e) => updateLoopParameterValue(idx, e.target.value)}
                                      placeholder={`Value ${idx + 1}`}
                                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                                    />
                                    {newLoopParameter.values.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeLoopParameterValue(idx)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={addLoopParameterValue}
                                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                                >
                                  + Add Value
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => saveNewLoopParameter(filter.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelAddingLoopParameter}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {filter.loopParameters && Object.entries(filter.loopParameters).map(([key, values]) => (
                            <div key={key} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{key}</span>
                                <button
                                  type="button"
                                  onClick={() => removeLoopParameter(filter.id, key)}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="space-y-1">
                                {values.map((value, idx) => (
                                  <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">
                                    [{idx}]: {value}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {(!filter.loopParameters || Object.keys(filter.loopParameters).length === 0) && addingLoopParameterFor !== filter.id && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                              No loop parameters added yet
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Parameters
                        </label>
                        {addingParameterFor !== filter.id && (
                          <button
                            type="button"
                            onClick={() => startAddingParameter(filter.id)}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            Add Parameter
                          </button>
                        )}
                      </div>

                      {addingParameterFor === filter.id && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
                          <input
                            type="text"
                            value={newParameter.key}
                            onChange={(e) => setNewParameter({ ...newParameter, key: e.target.value })}
                            placeholder="Parameter Key"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={newParameter.value}
                            onChange={(e) => setNewParameter({ ...newParameter, value: e.target.value })}
                            placeholder="Parameter Value"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveNewParameter(filter.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                            >
                              <Check className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelAddingParameter}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {Object.entries(filter.parameters).map(([key, value]) => {
                        const changeType = getParameterChangeType(filter.id, key, value);
                        const isDeleted = changeType === 'deleted';
                        const bgColor =
                          changeType === 'new' ? 'bg-green-100 dark:bg-green-900/30 border-green-500' :
                          changeType === 'modified' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500' :
                          changeType === 'deleted' ? 'bg-red-100 dark:bg-red-900/30 border-red-500' :
                          'bg-white dark:bg-gray-800';

                        return (
                          <div key={key} className={`flex items-center gap-2 p-2 rounded-lg border ${isDeleted ? 'opacity-60' : ''} ${changeType !== 'unchanged' ? 'border-2' : 'border-transparent'}`}>
                            <input
                              type="text"
                              value={key}
                              disabled
                              className={`flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm ${isDeleted ? 'line-through' : ''} text-gray-900 dark:text-white`}
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                updateFilterParameter(filter.id, key, e.target.value)
                              }
                              placeholder="Value"
                              disabled={isDeleted}
                              className={`flex-1 px-3 py-2 ${bgColor} border border-gray-300 dark:border-gray-600 rounded-lg text-sm ${isDeleted ? 'line-through' : ''} text-gray-900 dark:text-white`}
                            />
                            {!isDeleted ? (
                              <button
                                type="button"
                                onClick={() => removeParameter(filter.id, key)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                title="Delete parameter"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => restoreParameter(filter.id, key)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                title="Restore parameter"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {Object.keys(filter.parameters).length === 0 && addingParameterFor !== filter.id && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          No parameters added yet
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              <FileJson className="w-5 h-5" />
              Preview JSON
            </button>
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Download JSON
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
        ) : activeTab === 'templates' ? (
          <div className="space-y-6">
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <FileJson className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No templates found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Templates you create will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-600">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Experiment Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Generation</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Created At</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((template) => (
                      <tr key={template.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{template.experiment_name}</td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{template.generation}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            template.status === 'submitted'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : template.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : template.status === 'rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {template.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {new Date(template.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewTemplate(template)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditTemplate(template)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <FileJson className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">JSON Preview</h2>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Color-coded Change Tracking:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Green = New parameters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Yellow = Modified values</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Red = Deleted parameters</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                  {activeTab === 'upload'
                    ? 'Comparing current JSON with the originally uploaded file.'
                    : (originalFormState
                        ? 'Comparing current form state with the uploaded template.'
                        : 'No template uploaded - showing current form values without highlights.')}
                </p>
              </div>
              <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700 font-mono text-gray-900 dark:text-white">
                {activeTab === 'upload' ? renderUploadedJSONWithHighlights() : renderHighlightedJSON()}
              </pre>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  const jsonToCopy = activeTab === 'upload'
                    ? uploadedJSON
                    : JSON.stringify(generateFullPayload(), null, 2);
                  navigator.clipboard.writeText(jsonToCopy);
                  showAlert('success', 'JSON copied to clipboard!');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Copy JSON
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">View Template</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedTemplate.experiment_name} - {selectedTemplate.generation}
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700 font-mono text-gray-900 dark:text-white">
                {JSON.stringify(selectedTemplate.full_payload, null, 2)}
              </pre>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedTemplate.full_payload, null, 2));
                  showAlert('success', 'Template copied to clipboard!');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Copy JSON
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Template</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedTemplate.experiment_name} - {selectedTemplate.generation}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Color-coded Change Tracking:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Green = New parameters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Yellow = Modified values</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500"></div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Red = Deleted parameters</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                  Comparing current edits with the original template.
                </p>
              </div>
              <div className="relative w-full h-96 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white dark:bg-gray-900">
                <pre ref={editPreRef} className="absolute inset-0 w-full h-full px-4 py-3 font-mono text-sm overflow-auto pointer-events-none whitespace-pre-wrap break-words z-0 text-gray-900 dark:text-white">
                  {renderEditedJSONWithHighlights()}
                </pre>
                <textarea
                  ref={editTextareaRef}
                  value={editedTemplateJSON}
                  onChange={(e) => setEditedTemplateJSON(e.target.value)}
                  onScroll={handleEditTextareaScroll}
                  className="absolute inset-0 w-full h-full px-4 py-3 font-mono text-sm resize-none outline-none z-10"
                  placeholder="Edit your template JSON here"
                  spellCheck={false}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'transparent',
                    caretColor: 'rgb(59, 130, 246)'
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className={`pointer-events-auto max-w-md w-full mx-4 p-4 rounded-lg shadow-2xl border-2 ${
              alertMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300'
                : alertMessage.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-300'
            } animate-fade-in`}
          >
            <div className="flex items-center gap-3">
              {alertMessage.type === 'success' && (
                <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              )}
              <p className="font-semibold">{alertMessage.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCRCRequest;
