// Anonymous name generator
const anonymousNames = {
    adjectives: ['Hidden', 'Secret', 'Mystery', 'Shadow', 'Unknown', 'Silent', 'Stealth', 'Phantom', 'Ghost', 'Anon'],
    nouns: [' User', ' Visitor', ' Guest', ' Agent', ' Entity', ' Person', ' Browser', ' Explorer', ' Wanderer', ' Navigator'],
    
    generate: function() {
        const adjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
        const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
        return `${adjective}${noun}`;
    }
};

const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon'; 
    if (hour < 22) return 'Good Evening';
    return 'Good Night';
};

// Main settings object
const settings = {
    GREETING_MAX_LENGTH: 60,

    toggleTheme: () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        Storage.set('theme', newTheme);
        
        const themeIcon = document.querySelector('#toggle-theme i');
        themeIcon.className = `fas fa-${newTheme === 'dark' ? 'sun' : 'moon'}`;
    },

    toggleAnonymousMode: () => {
        const isAnonymous = Storage.get('anonymousMode') || false;
        Storage.set('anonymousMode', !isAnonymous);
        
        if (!isAnonymous) {
            const randomName = anonymousNames.generate();
            Storage.set('anonymousName', randomName);
            notifications.show('Anonymous mode enabled!', 'info');
        } else {
            Storage.remove('anonymousName');
            notifications.show('Anonymous mode disabled!', 'info');
        }
        
        shortcuts.render();
        updateGreeting();
    },

    updateSearchEngine: (engine) => {
        Storage.set('searchEngine', engine);
        notifications.show('Search engine updated successfully!', 'success');
    },
    
    // Update visibility of UI elements
    updateVisibility: () => {
        const elements = {
            greeting: {
                id: 'greeting',
                toggle: 'toggle-greeting',
                functions: ['updateGreeting'],
                name: 'Greeting'
            },
            search: {
                id: 'search-container',
                toggle: 'toggle-search',
                functions: ['search.init', 'search.perform'],
                name: 'Search bar'
            },
            shortcuts: {
                id: 'shortcuts-grid',
                toggle: 'toggle-shortcuts',
                functions: ['shortcuts.init', 'shortcuts.render'],
                name: 'Shortcuts'
            },
            addShortcut: {
                id: 'add-shortcut',
                toggle: 'toggle-add-shortcut',
                functions: [],
                name: 'Add shortcut button'
            }
        };

        Object.entries(elements).forEach(([key, element]) => {
            const isVisible = Storage.get(`show_${key}`);
            if (isVisible === null) Storage.set(`show_${key}`, true);
            
            const toggle = document.getElementById(element.toggle);
            const elementNode = document.getElementById(element.id);
            
            if (toggle && elementNode) {
                toggle.checked = isVisible !== false;
                if (isVisible === false) {
                    elementNode.style.visibility = 'hidden';
                    elementNode.style.opacity = '0';
                    elementNode.style.position = 'absolute';
                    elementNode.style.pointerEvents = 'none';
                } else {
                    elementNode.style.visibility = 'visible';
                    elementNode.style.opacity = '1';
                    elementNode.style.position = 'relative';
                    elementNode.style.pointerEvents = 'auto';
                }
                
                toggle.addEventListener('change', (e) => {
                    const isChecked = e.target.checked;
                    Storage.set(`show_${key}`, isChecked);
                    
                    if (isChecked) {
                        elementNode.style.visibility = 'visible';
                        elementNode.style.opacity = '1';
                        elementNode.style.position = 'relative';
                        elementNode.style.pointerEvents = 'auto';
                    } else {
                        elementNode.style.visibility = 'hidden';
                        elementNode.style.opacity = '0';
                        elementNode.style.position = 'absolute';
                        elementNode.style.pointerEvents = 'none';
                    }
                    
                    if (key === 'shortcuts') {
                        const addShortcutBtn = document.getElementById('add-shortcut');
                        const addShortcutVisible = Storage.get('show_addShortcut') !== false;
                        
                        if (addShortcutBtn && !isChecked && !addShortcutVisible) {
                            addShortcutBtn.style.visibility = 'hidden';
                            addShortcutBtn.style.opacity = '0';
                            addShortcutBtn.style.position = 'absolute';
                            addShortcutBtn.style.pointerEvents = 'none';
                        } else if (addShortcutBtn && addShortcutVisible) {
                            addShortcutBtn.style.visibility = 'visible';
                            addShortcutBtn.style.opacity = '1';
                            addShortcutBtn.style.position = 'relative';
                            addShortcutBtn.style.pointerEvents = 'auto';
                        }
                    }

                    notifications.show(
                        `${element.name} ${isChecked ? 'shown' : 'hidden'}!`,
                        isChecked ? 'success' : 'info'
                    );
                });
            }
        });
    },

    // Initialize settings
    init: () => {
        const settingsButton = document.getElementById('settings-button');
        const settingsModal = document.getElementById('settings-modal');
        const closeSettings = document.getElementById('close-settings');
        
        settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            settings.updateSettingsUI();
            settingsModal.classList.remove('hidden');
            settingsModal.classList.add('active');
        });
        
        closeSettings.addEventListener('click', () => {
            settingsModal.classList.remove('active');
            setTimeout(() => {
                settingsModal.classList.add('hidden');
            }, 300);
        });
        
        const themeToggle = document.getElementById('toggle-theme');
        themeToggle.addEventListener('click', settings.toggleTheme);
        
        const anonymousToggle = document.getElementById('toggle-anonymous');
        anonymousToggle.addEventListener('change', settings.toggleAnonymousMode);
        
        const searchEngineSelect = document.getElementById('search-engine-select');
        searchEngineSelect.addEventListener('change', (e) => {
            settings.updateSearchEngine(e.target.value);
        });
        
        const nameInput = document.getElementById('settings-name');
        nameInput.addEventListener('change', (e) => {
            const newName = e.target.value.trim();
            if (newName) {
                Storage.set('userName', newName);
                updateGreeting();
                notifications.show('Name updated successfully!', 'success');
            }
        });
        
        const savedTheme = Storage.get('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        const themeIcon = document.querySelector('#toggle-theme i');
        themeIcon.className = `fas fa-${savedTheme === 'dark' ? 'sun' : 'moon'}`;
        
        settings.initDataManagement();
        settings.updateVisibility();

        const customGreetingInput = document.getElementById('custom-greeting');
        customGreetingInput.maxLength = settings.GREETING_MAX_LENGTH;
        
        customGreetingInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.length > settings.GREETING_MAX_LENGTH) {
                e.target.value = value.substring(0, settings.GREETING_MAX_LENGTH);
                notifications.show(`Custom greeting must be less than ${settings.GREETING_MAX_LENGTH} characters`, 'error');
            }
        });

        customGreetingInput.addEventListener('change', (e) => {
            const value = e.target.value.trim();
            
            if (value.length > settings.GREETING_MAX_LENGTH) {
                e.target.value = value.substring(0, settings.GREETING_MAX_LENGTH);
                notifications.show(`Custom greeting must be less than ${settings.GREETING_MAX_LENGTH} characters`, 'error');
                return;
            }
            
            if (value === '') {
                Storage.remove('customGreeting');
                notifications.show('Using default greeting format', 'info');
            } else {
                const testFormat = settings.formatGreeting(value);
                if (testFormat) {
                    Storage.set('customGreeting', value);
                    notifications.show('Custom greeting updated!', 'success');
                }
            }
            updateGreeting();
        });
    },

    updateSettingsUI: () => {
        const userName = Storage.get('userName') || '';
        const isAnonymous = Storage.get('anonymousMode') || false;
        const currentEngine = Storage.get('searchEngine') || 'google';
        
        document.getElementById('settings-name').value = userName;
        document.getElementById('toggle-anonymous').checked = isAnonymous;
        document.getElementById('search-engine-select').value = currentEngine;

        ['greeting', 'search', 'shortcuts', 'addShortcut'].forEach(element => {
            const isVisible = Storage.get(`show_${element}`);
            const toggle = document.getElementById(`toggle-${element}`);
            if (toggle) {
                toggle.checked = isVisible !== false;
            }
        });

        const customGreeting = Storage.get('customGreeting') || '';
        document.getElementById('custom-greeting').value = customGreeting;
    },

    formatGreeting: (format) => {
        try {
            if (!format) return null;
            
            const validTokens = ['{name}', '{greeting}', '{time}', '{date}', '{day}', '{month}', '{year}'];
            const tokens = format.match(/{[^}]+}/g) || [];
            
            if (!tokens.every(token => validTokens.includes(token))) {
                notifications.show('Invalid greeting format: Unknown token used', 'error');
                return null;
            }

            const now = new Date();
            const hour = now.getHours();
            let timeGreeting = 'good night';
            if (hour >= 5 && hour < 12) timeGreeting = 'good morning';
            else if (hour >= 12 && hour < 17) timeGreeting = 'good afternoon';
            else if (hour >= 17 && hour < 20) timeGreeting = 'good evening';

            const userName = Storage.get('anonymousMode') ? 
                (Storage.get('anonymousName') || anonymousNames.generate()) : 
                (Storage.get('userName') || 'Friend');

            const formats = {
                name: userName,
                greeting: format.startsWith('{greeting}') ? 
                    timeGreeting.charAt(0).toUpperCase() + timeGreeting.slice(1) : 
                    timeGreeting,
                time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                date: now.getDate().toString(),
                day: now.toLocaleDateString([], { weekday: 'long' }),
                month: now.toLocaleDateString([], { month: 'long' }),
                year: now.getFullYear()
            };

            let formattedGreeting = format;
            Object.entries(formats).forEach(([key, value]) => {
                formattedGreeting = formattedGreeting.replace(
                    new RegExp(`{${key}}`, 'g'), 
                    value
                );
            });

            if (/{[^}]+}/.test(formattedGreeting)) {
                throw new Error('Invalid format used');
            }

            return formattedGreeting;
        } catch (e) {
            notifications.show('Invalid greeting format. Using default.', 'error');
            return null;
        }
    },

    // Data management functions
    exportData: () => {
        const data = {
            settings: {
                theme: Storage.get('theme'),
                userName: Storage.get('userName'),
                anonymousMode: Storage.get('anonymousMode'),
                anonymousName: Storage.get('anonymousName'),
                searchEngine: Storage.get('searchEngine'),
                customGreeting: Storage.get('customGreeting'),
                show_greeting: Storage.get('show_greeting'),
                show_search: Storage.get('show_search'),
                show_shortcuts: Storage.get('show_shortcuts'),
                show_addShortcut: Storage.get('show_addShortcut')
            },
            shortcuts: Storage.get('shortcuts') || [],
            keybinds: Storage.get('keybinds') || {}
        };

        if (!data.settings || !data.shortcuts || !data.keybinds) {
            notifications.show('Failed to export data: Invalid data structure.', 'error');
            return;
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'jstar-tab-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importData: async (file) => {
        const text = await file.text();
        
        try {
            const data = JSON.parse(text);
            
            if (!data.settings || typeof data.settings !== 'object' ||
                !Array.isArray(data.shortcuts) ||
                !data.keybinds || typeof data.keybinds !== 'object') {
                throw new Error('Invalid data structure');
            }

            Object.entries(data.settings).forEach(([key, value]) => {
                Storage.set(key, value);
            });

            Storage.set('shortcuts', data.shortcuts);

            const validatedKeybinds = {};
            Object.entries(data.keybinds).forEach(([action, binding]) => {
                if (binding && typeof binding === 'object' && 
                    typeof binding.keys === 'string' &&
                    (!binding.url || typeof binding.url === 'string')) {
                    validatedKeybinds[action] = binding;
                }
            });
            Storage.set('keybinds', validatedKeybinds);

            settings.updateSettingsUI();
            settings.updateVisibility();
            shortcuts.render();
            document.body.setAttribute('data-theme', data.settings.theme || 'light');
            
            notifications.show('Data imported successfully!', 'success');
        } catch (error) {
            notifications.show('Failed to import data: Invalid file format!', 'error');
            console.error('Import error:', error);
        }
    },

    resetData: () => {
        const defaultSettings = {
            theme: 'light',
            userName: '',
            anonymousMode: false,
            searchEngine: 'Google',
            show_greeting: true,
            show_search: true,
            show_shortcuts: true,
            show_addShortcut: true
        };

        Object.entries(defaultSettings).forEach(([key, value]) => {
            Storage.set(key, value);
        });

        Storage.remove('shortcuts');
        Storage.remove('keybinds');
        Storage.remove('anonymousName');
        Storage.remove('customGreeting');

        settings.updateSettingsUI();
        settings.updateVisibility();
        shortcuts.render();
        document.body.setAttribute('data-theme', 'light');
        
        notifications.show('All data has been reset!', 'success');
    }
};

// Initialize data management
settings.initDataManagement = () => {
    const exportBtn = document.getElementById('export-data');
    const importBtn = document.getElementById('import-data');
    const resetBtn = document.getElementById('reset-data');
    const fileInput = document.getElementById('import-file');

    exportBtn.replaceWith(exportBtn.cloneNode(true));
    const newExportBtn = document.getElementById('export-data');

    newExportBtn.addEventListener('click', () => {
        try {
            const data = {
                settings: {
                    theme: Storage.get('theme'),
                    userName: Storage.get('userName'),
                    anonymousMode: Storage.get('anonymousMode'),
                    anonymousName: Storage.get('anonymousName'),
                    searchEngine: Storage.get('searchEngine'),
                    show_greeting: Storage.get('show_greeting'),
                    show_search: Storage.get('show_search'),
                    show_shortcuts: Storage.get('show_shortcuts'),
                    show_addShortcut: Storage.get('show_addShortcut'),
                    customGreeting: Storage.get('customGreeting')
                },
                shortcuts: Storage.get('shortcuts') || [],
                keybinds: Storage.get('keybinds') || {}
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'jstar-tab-backup.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            notifications.show('Data exported successfully!', 'success');
        } catch (error) {
            notifications.show('Failed to export data!', 'error');
            console.error('Export error:', error);
        }
    });

    importBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (!data.shortcuts || !data.settings || !data.keybinds) {
                    throw new Error('Invalid backup file format');
                }

                Object.entries(data.settings).forEach(([key, value]) => {
                    Storage.set(key, value);
                });

                if (data.keybinds) {
                    const validatedKeybinds = {};
                    Object.entries(data.keybinds).forEach(([action, binding]) => {
                        if (binding && typeof binding === 'object' && 
                            typeof binding.keys === 'string' &&
                            (!binding.url || typeof binding.url === 'string')) {
                            validatedKeybinds[action] = binding;
                        }
                    });
                    Storage.set('keybinds', validatedKeybinds);
                    keybinds.init();
                }

                Storage.set('shortcuts', data.shortcuts);

                fileInput.value = '';

                ['greeting', 'search', 'shortcuts', 'addShortcut'].forEach(element => {
                    const isVisible = data.settings[`show_${element}`];
                    const elementNode = document.getElementById(element === 'search' ? 'search-container' : element);
                    const toggle = document.getElementById(`toggle-${element}`);
                    
                    if (elementNode && toggle) {
                        toggle.checked = isVisible !== false;
                        if (isVisible === false) {
                            elementNode.style.visibility = 'hidden';
                            elementNode.style.opacity = '0';
                            elementNode.style.position = 'absolute';
                            elementNode.style.pointerEvents = 'none';
                        } else {
                            elementNode.style.visibility = 'visible';
                            elementNode.style.opacity = '1';
                            elementNode.style.position = 'relative';
                            elementNode.style.pointerEvents = 'auto';
                        }
                    }
                });

                const shortcutsVisible = data.settings.show_shortcuts !== false;
                const addShortcutVisible = data.settings.show_addShortcut !== false;
                const addShortcutBtn = document.getElementById('add-shortcut');

                if (addShortcutBtn) {
                    if (!shortcutsVisible && !addShortcutVisible) {
                        addShortcutBtn.style.visibility = 'hidden';
                        addShortcutBtn.style.opacity = '0';
                        addShortcutBtn.style.position = 'absolute';
                        addShortcutBtn.style.pointerEvents = 'none';
                    } else if (addShortcutVisible) {
                        addShortcutBtn.style.visibility = 'visible';
                        addShortcutBtn.style.opacity = '1';
                        addShortcutBtn.style.position = 'relative';
                        addShortcutBtn.style.pointerEvents = 'auto';
                    }
                }

                shortcuts.render();
                updateGreeting();
                search.init();
                document.body.setAttribute('data-theme', data.settings.theme || 'light');
                settings.updateSettingsUI();
                settings.updateVisibility();

                const greetingElement = document.getElementById('greeting');
                if (greetingElement) {
                    const userName = data.settings.anonymousMode ? data.settings.anonymousName : data.settings.userName;
                    const timeBasedGreeting = getTimeBasedGreeting();
                    greetingElement.textContent = `${timeBasedGreeting}, ${userName || 'Guest'}!`;
                }

                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.placeholder = `Search ${data.settings.searchEngine || 'Google'}...`;
                }

                if (addShortcutBtn) {
                    addShortcutBtn.style.display = data.settings.show_addShortcut !== false ? 'block' : 'none';
                }

                if (data.settings.customGreeting) {
                    Storage.set('customGreeting', data.settings.customGreeting);
                    const testFormat = settings.formatGreeting(data.settings.customGreeting);
                    if (!testFormat) {
                        notifications.show('Invalid custom greeting format in imported data', 'error');
                        Storage.remove('customGreeting');
                    }
                }

                notifications.show('Data imported successfully!', 'success');
            } catch (error) {
                notifications.show('Failed to import data: Invalid file format!', 'error');
                console.error('Import error:', error);
            }
        };

        reader.onerror = () => {
            notifications.show('Failed to read file!', 'error');
        };

        reader.readAsText(file);
    });

    resetBtn.addEventListener('click', () => {
        const confirmReset = confirm('Are you sure you want to reset all data? This action cannot be undone.');
        
        if (confirmReset) {
            try {
                Storage.remove('customGreeting');
                Storage.clear();
                closeModal(document.getElementById('settings-modal'));
                notifications.show('All data has been reset!', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } catch (error) {
                notifications.show('Failed to reset data!', 'error');
                console.error('Reset error:', error);
            }
        }
    });
};