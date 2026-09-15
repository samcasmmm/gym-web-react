import React from 'react';
import Loader from './Loader';
import { VideoItem } from '../api/exerciseApi';
import { PlayCircle, ExternalLink } from 'lucide-react';

interface ExercisesVideoProps {
  exerciseVideo: VideoItem[];
  name?: string;
  isLoading?: boolean;
}

const ExercisesVideo: React.FC<ExercisesVideoProps> = ({ exerciseVideo, name, isLoading }) => {
  if (isLoading) {
    return <Loader />;
  }

  if (!exerciseVideo || !exerciseVideo.length) {
    return null;
  }

  return (
    <section className='mt-12 sm:mt-16 bg-white rounded-xl p-6 sm:p-8 border border-gray-200/80 shadow-xs'>
      <h2 className='text-xl sm:text-2xl font-black text-gray-900 mb-6'>
        Watch <span className='text-[#FF2625] capitalize'>{name}</span> Video Form Guides
      </h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'>
        {exerciseVideo.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target='_blank'
            rel='noreferrer'
            className='flex flex-col bg-white rounded-lg overflow-hidden shadow-xs hover:shadow-md border border-gray-200 transition-colors group'
          >
            <div className='relative aspect-video w-full overflow-hidden bg-gray-900 flex items-center justify-center'>
              <img
                src={item.thumbnail}
                alt={item.title}
                className='w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity'
              />
              <div className='absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-center justify-center'>
                <PlayCircle className='w-14 h-14 text-white drop-shadow-md group-hover:scale-110 group-hover:text-[#FF2625] transition-all duration-300' />
              </div>
            </div>
            <div className='p-4 flex flex-col justify-between flex-grow'>
              <h3 className='font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#FF2625] transition-colors line-clamp-2'>
                {item.title}
              </h3>
              <div className='flex items-center justify-between text-sm font-semibold text-gray-500 mt-3 pt-2 border-t border-gray-50'>
                <span>{item.channelName}</span>
                <span className='inline-flex items-center gap-1 text-[#FF2625] text-xs font-bold uppercase tracking-wider'>
                  Watch on YouTube <ExternalLink className='w-3.5 h-3.5' />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default ExercisesVideo;
