import React from 'react';
import { DownloadIcon } from './icons';

interface ImageViewerProps {
    originalImageUrl: string;
    currentImageUrl: string;

    currentTitle: string;
    currentFullPrompt: string;
}

const ImageDisplay: React.FC<{ imageUrl: string; label: string; title?: string; fullPrompt?: string }> = ({ imageUrl, label, title, fullPrompt }) => (
    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-800 shadow-lg">
        <img src={imageUrl} alt={label} className="w-full h-full object-contain" />
        <div className="absolute top-0 left-0 bg-black/50 px-3 py-1 text-sm font-medium rounded-br-lg">{label}</div>
        {title && (
             <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                 <p className="text-sm text-white truncate" title={fullPrompt}>{title}</p>
             </div>
        )}
    </div>
);


const ImageViewer: React.FC<ImageViewerProps> = ({ originalImageUrl, currentImageUrl, currentTitle, currentFullPrompt }) => {
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = currentImageUrl;
        link.download = `bananasplit-edit-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageDisplay imageUrl={originalImageUrl} label="Original" />
                <ImageDisplay imageUrl={currentImageUrl} label="Current Edit" title={currentTitle} fullPrompt={currentFullPrompt} />
            </div>
            <button
                onClick={handleDownload}
                className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors shadow-md disabled:opacity-50"
            >
                <DownloadIcon className="w-5 h-5" />
                Download Current Image
            </button>
        </div>
    );
};

export default ImageViewer;