import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

const Plugin = ({ enabled: initialEnabled, label }) => {
    const [enabled, setEnabled] = useState(initialEnabled);

    useEffect(() => {
        setEnabled(initialEnabled);
    }, [initialEnabled]);

    const updateEnabled = ({ target: { checked } }) => {
        setEnabled(checked);
        window.plugins.togglePlugin(label);
    };

    return (
        <div className='plugin'>
            <div className='plugin-name'>{label}</div>
            <div className='checkbox-wrapper'>
                <input
                    checked={enabled}
                    className='checkbox'
                    onChange={updateEnabled}
                    type='checkbox'
                />
                <div className='toggle'></div>
            </div>
        </div>
    );
};

const Sound = ({
    filePath: initialFilePath = '',
    name,
    volume: initialVolume = 0,
}) => {
    const volumeRef = useRef(null);
    const [filePath, setFilePath] = useState(initialFilePath);
    const [volume, setVolume] = useState(initialVolume);

    const updateFilePath = ({ target: { value } }) => {
        setFilePath(value);
    };
    const updateVolume = ({ target: { value } }) => {
        setVolume(value);
    };

    useEffect(() => {
        window.quadrakill.updateSound({
            filePath,
            name,
            volume,
        });
    }, [filePath, volume]);

    useEffect(() => {
        const percent = 100 * volume;
        volumeRef.current.style.left = `calc(${percent}% - ${volume * 40}px)`;
    }, [volume, volumeRef]);

    return (
        <div className='sound'>
            <div className='sound-name'>{name}</div>
            <div className='sound-path-wrapper'>
                <input
                    className='sound-path'
                    onChange={updateFilePath}
                    placeholder=' '
                    type='text'
                    value={filePath}
                />
                <span className='sound-path-label'>File Path:</span>
            </div>
            <div className='sound-volume-wrapper'>
                <input
                    className='sound-volume'
                    max={1}
                    min={0}
                    onChange={updateVolume}
                    step={0.01}
                    type='range'
                    value={volume}
                />
                <div className='sound-volume-value' ref={volumeRef}>{`${(
                    volume * 100
                ).toFixed(0)}%`}</div>
            </div>
        </div>
    );
};

const App = () => {
    const [plugins, setPlugins] = useState({});
    const [sounds, setSounds] = useState({});
    const [quadrakillConnected, setQuadrakillConnected] = useState(false);

    useEffect(() => {
        window.plugins.requestPlugins().then((requestedPlugins) => {
            setPlugins(requestedPlugins);
        });
        if (window.quadrakill.enabled) {
            window.quadrakill.requestSounds().then((requestedSounds) => {
                setSounds(requestedSounds);
            });
        }

        window.quadrakill.quadrakillUpdateFromTray(
            (_event, { isDisconnected }) => {
                setQuadrakillConnected(!isDisconnected);
            }
        );
    }, []);

    useEffect(() => {
        if (Object.keys(plugins).length > 0) {
            window.plugins.pluginUpdateFromTray(
                (_event, { enabled, label }) => {
                    plugins[label].enabled = enabled;
                    setPlugins({ ...plugins });
                }
            );
        }
    }, [plugins]);

    const pluginsDisplay = () => {
        return Object.keys(plugins).map((key) => {
            return (
                <Plugin enabled={plugins[key].enabled} key={key} label={key} />
            );
        });
    };

    const soundsDisplay = () => {
        return Object.keys(sounds).map((key) => {
            return (
                <Sound
                    filePath={sounds[key].soundFile}
                    key={key}
                    name={key}
                    volume={sounds[key].volume}
                />
            );
        });
    };

    const toggleQuadrakill = ({ target: { checked } }) => {
        setQuadrakillConnected(checked);
        window.quadrakill.toggleQuadrakill();
    };

    return (
        <div>
            <h1>Support Settings</h1>
            <div className='plugins'>
                <h2>Plugins</h2>
                <div className='plugins-wrapper'>
                    {pluginsDisplay()}
                </div>
            </div>
            {window.quadrakill.enabled && (
                <div className='quadrakill'>
                    <div className='quadrakill-name-and-toggle'>
                        <h2>Quadrakill</h2>
                        <div className='checkbox-wrapper quadrakill-toggle'>
                            <input
                                checked={quadrakillConnected}
                                className='checkbox'
                                onChange={toggleQuadrakill}
                                type='checkbox'
                            />
                            <div className='toggle'></div>
                        </div>
                    </div>
                    <div>
                        {soundsDisplay()}
                    </div>
                </div>
            )}
        </div>
    );
};

const domNode = document.getElementById('app-root');
const root = createRoot(domNode);
root.render(<App />);
