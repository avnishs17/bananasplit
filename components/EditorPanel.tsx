
import React, { useState } from 'react';
import { CommitIcon, BranchIcon, MergeIcon } from './icons';

interface EditorPanelProps {
    onCommit: (prompt: string) => void;
    onBranch: (prompt: string) => void;
    onMerge: (prompt: string) => void;
    isMerging: boolean;
    disabled: boolean;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ onCommit, onBranch, onMerge, isMerging, disabled }) => {
    const [prompt, setPrompt] = useState('');

    const handleCommit = () => {
        if (prompt.trim()) {
            onCommit(prompt);
            setPrompt('');
        }
    };

    const handleBranch = () => {
        if (prompt.trim()) {
            onBranch(prompt);
            setPrompt('');
        }
    };
    
    const handleMerge = () => {
        if (prompt.trim()) {
            onMerge(prompt);
            setPrompt('');
        }
    };
    
    const placeholderText = isMerging
        ? "Describe how to merge the selected versions..."
        : "Describe your desired changes...";

    return (
        <div className="flex flex-col space-y-4">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={placeholderText}
                disabled={disabled}
                rows={3}
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors text-gray-100 placeholder-gray-500 resize-none"
            />
            <div className="flex items-center justify-end flex-wrap gap-3">
                {isMerging ? (
                    <button
                        onClick={handleMerge}
                        disabled={disabled || !prompt.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MergeIcon className="w-5 h-5" />
                        Merge Commits
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleBranch}
                            disabled={disabled || !prompt.trim()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <BranchIcon className="w-5 h-5" />
                            Branch
                        </button>
                        <button
                            onClick={handleCommit}
                            disabled={disabled || !prompt.trim()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CommitIcon className="w-5 h-5" />
                            Commit
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditorPanel;