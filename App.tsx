import React, { useState, useCallback } from 'react';
import { Commit, CommitTree } from './types';
import { editImage, generateCommitTitle } from './services/geminiService';
import { fileToDataUrl, createThumbnail } from './utils/imageUtils';
import ImageUploader from './components/ImageUploader';
import HistoryGraph from './components/HistoryGraph';
import ImageViewer from './components/ImageViewer';
import EditorPanel from './components/EditorPanel';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorToast from './components/ErrorToast';

const App: React.FC = () => {
    const [commitTree, setCommitTree] = useState<CommitTree>({});
    const [rootCommitId, setRootCommitId] = useState<string | null>(null);
    const [currentCommitId, setCurrentCommitId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);

    const handleError = (message: string, duration: number = 5000) => {
        setError(message);
        setTimeout(() => setError(null), duration);
    };

    const addCommit = (newCommit: Commit) => {
        setCommitTree(prevTree => {
            const updatedTree = { ...prevTree, [newCommit.id]: newCommit };
            newCommit.parentIds.forEach(parentId => {
                if (updatedTree[parentId]) {
                    updatedTree[parentId] = {
                        ...updatedTree[parentId],
                        childrenIds: [...updatedTree[parentId].childrenIds, newCommit.id],
                    };
                }
            });
            return updatedTree;
        });
        setCurrentCommitId(newCommit.id);
    };

    const handleImageUpload = useCallback(async (file: File) => {
        setIsLoading(true);
        setLoadingMessage('Preparing initial image...');
        try {
            const imageDataUrl = await fileToDataUrl(file);
            const thumbnailDataUrl = await createThumbnail(imageDataUrl);
            const newCommit: Commit = {
                id: crypto.randomUUID(),
                parentIds: [],
                title: 'Initial Image',
                prompt: 'Initial image',
                imageDataUrl,
                thumbnailDataUrl,
                childrenIds: [],
                timestamp: Date.now(),
            };
            setCommitTree({ [newCommit.id]: newCommit });
            setRootCommitId(newCommit.id);
            setCurrentCommitId(newCommit.id);
        } catch (err) {
            handleError('Failed to load image. Please try another one.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const processCommit = useCallback(async (prompt: string, parentIds: string[], baseImageCommitId: string) => {
        setIsLoading(true);
        try {
            const parentCommit = commitTree[baseImageCommitId];
            if (!parentCommit) throw new Error("Parent commit not found");
            
            setLoadingMessage('Generating commit title...');
            const title = await generateCommitTitle(prompt);

            setLoadingMessage('Applying visual changes with Gemini...');
            const newImageDataUrl = await editImage(parentCommit.imageDataUrl, prompt);
            const newThumbnailDataUrl = await createThumbnail(newImageDataUrl);

            const newCommit: Commit = {
                id: crypto.randomUUID(),
                parentIds,
                title,
                prompt,
                imageDataUrl: newImageDataUrl,
                thumbnailDataUrl: newThumbnailDataUrl,
                childrenIds: [],
                timestamp: Date.now(),
            };
            addCommit(newCommit);
            return newCommit.id;
        } catch (err) {
            console.error(err);
            handleError((err as Error).message || 'An unknown error occurred during commit.');
            return null;
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [commitTree]);

    const handleCommit = useCallback(async (prompt: string) => {
        if (!currentCommitId) return;
        await processCommit(prompt, [currentCommitId], currentCommitId);
    }, [currentCommitId, processCommit]);

    const handleBranch = useCallback(async (prompt: string) => {
        if (!currentCommitId) return;
        const newCommitId = await processCommit(prompt, [currentCommitId], currentCommitId);
        if(newCommitId) {
             setCommitTree(prev => ({
                ...prev,
                [newCommitId]: { ...prev[newCommitId], branchName: `Branch from ${currentCommitId.substring(0,4)}` }
            }));
        }
    }, [currentCommitId, processCommit]);

    const handleMerge = useCallback(async (prompt: string) => {
        if (selectedForMerge.length !== 2) return;
        const [commitId1, commitId2] = selectedForMerge;
        
        const commit1 = commitTree[commitId1];
        const commit2 = commitTree[commitId2];
        const baseCommit = commit1.timestamp > commit2.timestamp ? commit1 : commit2; // Use the latest as base
        
        const mergePrompt = `Merge the following changes into the base image. The desired outcome should incorporate elements from the version titled "${commit2.title}" with elements from the version titled "${commit1.title}". Specifically, apply this instruction: "${prompt}"`;
        
        await processCommit(mergePrompt, [commitId1, commitId2], baseCommit.id);
        setSelectedForMerge([]);
    }, [selectedForMerge, commitTree, processCommit]);

    const handleRevert = useCallback((commitId: string) => {
        if (!commitTree[commitId] || !currentCommitId) return;
        
        const originalCommit = commitTree[commitId];
        const newCommit: Commit = {
            id: crypto.randomUUID(),
            parentIds: [currentCommitId],
            title: `Revert to: "${originalCommit.title}"`,
            prompt: `Reverted to commit ${commitId}: "${originalCommit.prompt}"`,
            imageDataUrl: originalCommit.imageDataUrl,
            thumbnailDataUrl: originalCommit.thumbnailDataUrl,
            childrenIds: [],
            timestamp: Date.now(),
        };
        addCommit(newCommit);
    }, [commitTree, currentCommitId]);

    const handleSelectCommit = useCallback((commitId: string) => {
        setCurrentCommitId(commitId);
        setSelectedForMerge([]);
    }, []);

    const toggleMergeSelection = useCallback((commitId: string) => {
        setSelectedForMerge(prev => {
            if (prev.includes(commitId)) {
                return prev.filter(id => id !== commitId);
            }
            if (prev.length < 2) {
                return [...prev, commitId];
            }
            return [prev[1], commitId]; // Keep last two
        });
    }, []);

    if (!rootCommitId) {
        return <ImageUploader onImageUpload={handleImageUpload} isLoading={isLoading} />;
    }

    const currentCommit = currentCommitId ? commitTree[currentCommitId] : null;
    const rootCommit = rootCommitId ? commitTree[rootCommitId] : null;

    return (
        <div className="flex h-screen w-screen bg-gray-900 text-gray-100 font-sans antialiased overflow-hidden">
            <aside className="w-[480px] flex-shrink-0 p-4 overflow-y-auto border-r border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
                <HistoryGraph
                    commitTree={commitTree}
                    rootCommitId={rootCommitId}
                    currentCommitId={currentCommitId}
                    selectedForMerge={selectedForMerge}
                    onSelectCommit={handleSelectCommit}
                    onToggleMergeSelection={toggleMergeSelection}
                    onRevert={handleRevert}
                />
            </aside>

            <main className="flex-grow flex flex-col relative">
                {currentCommit && rootCommit && (
                    <div className="flex-grow p-6 flex flex-col items-center justify-center">
                        <ImageViewer
                            originalImageUrl={rootCommit.imageDataUrl}
                            currentImageUrl={currentCommit.imageDataUrl}
                            currentTitle={currentCommit.title}
                            currentFullPrompt={currentCommit.prompt}
                        />
                    </div>
                )}
                
                <div className="flex-shrink-0 border-t border-gray-700/50 p-4 bg-gray-800/30">
                    <EditorPanel
                        onCommit={handleCommit}
                        onBranch={handleBranch}
                        onMerge={handleMerge}
                        isMerging={selectedForMerge.length === 2}
                        disabled={isLoading}
                    />
                </div>
            </main>
            
            {isLoading && <LoadingOverlay message={loadingMessage} />}
            {error && <ErrorToast message={error} onClose={() => setError(null)} />}
        </div>
    );
};

export default App;