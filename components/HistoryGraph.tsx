import React from 'react';
import { Commit, CommitTree } from '../types';
import { RevertIcon } from './icons';

interface CommitNodeProps {
    commit: Commit;
    isCurrent: boolean;
    isSelectedForMerge: boolean;
    onSelect: () => void;
    onToggleMerge: () => void;
    onRevert: () => void;
}

const CommitNode: React.FC<CommitNodeProps> = ({ commit, isCurrent, isSelectedForMerge, onSelect, onToggleMerge, onRevert }) => {
    const baseClasses = "relative flex items-center p-2 rounded-lg transition-all duration-200 cursor-pointer group";
    const selectedClasses = isCurrent ? "bg-yellow-400/20 ring-2 ring-yellow-400" : "bg-gray-800 hover:bg-gray-700/80";
    const mergeSelectedClasses = isSelectedForMerge ? "ring-2 ring-blue-500" : "";
    
    return (
        <div className={`${baseClasses} ${selectedClasses} ${mergeSelectedClasses} min-w-[300px]`} title={commit.prompt}>
            <img src={commit.thumbnailDataUrl} alt="commit thumbnail" className="w-16 h-16 rounded-md object-cover flex-shrink-0" onClick={onSelect} />
            <div className="ml-3 flex-grow overflow-hidden" onClick={onSelect}>
                <p className={`font-semibold text-sm truncate ${isCurrent ? 'text-yellow-300' : 'text-gray-100'}`}>
                    {commit.title}
                </p>
                <p className="text-xs text-gray-400">
                    {new Date(commit.timestamp).toLocaleString()}
                </p>
                {commit.branchName && (
                     <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded mt-1 inline-block">
                        {commit.branchName}
                     </span>
                )}
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onRevert(); }}
                    title="Revert to this version in a new commit"
                    className="p-1.5 rounded-full hover:bg-gray-600 text-gray-400 hover:text-white"
                >
                    <RevertIcon className="w-4 h-4" />
                </button>
                <input
                    type="checkbox"
                    checked={isSelectedForMerge}
                    onChange={(e) => { e.stopPropagation(); onToggleMerge(); }}
                    title="Select for merge"
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
};

interface HistoryGraphProps {
    commitTree: CommitTree;
    rootCommitId: string;
    currentCommitId: string | null;
    selectedForMerge: string[];
    onSelectCommit: (id: string) => void;
    onToggleMergeSelection: (id: string) => void;
    onRevert: (id: string) => void;
}

const HistoryGraph: React.FC<HistoryGraphProps> = ({ commitTree, rootCommitId, ...props }) => {
    const renderedCommitIds = new Set<string>();

    const renderTree = (commitId: string): React.ReactNode => {
        if (renderedCommitIds.has(commitId)) {
            return null;
        }
        renderedCommitIds.add(commitId);

        const commit = commitTree[commitId];
        if (!commit) return null;

        return (
            <div key={commit.id} className="relative flex items-start space-x-4">
                {/* Vertical line connecting to parent */}
                 {commit.parentIds.length > 0 && (
                    <div className="absolute top-0 left-[-24px] w-px h-full bg-gray-700"></div>
                )}
                {/* Horizontal line */}
                {commit.parentIds.length > 0 && (
                     <div className="absolute top-10 left-[-24px] w-6 h-px bg-gray-700"></div>
                )}
                
                <div className="flex flex-col items-start space-y-4">
                    <CommitNode
                        commit={commit}
                        isCurrent={commit.id === props.currentCommitId}
                        isSelectedForMerge={props.selectedForMerge.includes(commit.id)}
                        onSelect={() => props.onSelectCommit(commit.id)}
                        onToggleMerge={() => props.onToggleMergeSelection(commit.id)}
                        onRevert={() => props.onRevert(commit.id)}
                    />

                    {commit.childrenIds.length > 0 && (
                        <div className="pl-12 relative">
                            {commit.childrenIds.map(childId => renderTree(childId))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-white">Commit History</h2>
            <div className="relative">
                {renderTree(rootCommitId)}
            </div>
        </div>
    );
};

export default HistoryGraph;