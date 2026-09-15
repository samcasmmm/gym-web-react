import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom';
import { Box } from '@mui/system';
import { exerciseOptions, fetchData, youtubeOption } from '../utils/fetchData'
import Detail from '../components/Detail';
import ExercisesVideo from '../components/ExercisesVideo';
import SimilairExercises from '../components/SimilairExercises';

const ExerciseDetail = () => {

  const [exerciseDetail, setExerciseDetail] = useState({});
  const [exerciseVideo, setExerciseVideo] = useState([]);
  const [targetMuscleVideo, setTargetMuscleVideo] = useState([]);
  const [equipmentVideo, setEquipmentVideo] = useState([]);
  
  const {id} = useParams();
  
  useEffect(() => {
    const fetchExercisesData = async () =>{
        const exerciseDbUrl = 'https://exercisedb.p.rapidapi.com';
        
        const youtubeSearchUrl = 'https://youtube-search-and-download.p.rapidapi.com';

        
        const exerciseDetailData = await fetchData(`${exerciseDbUrl}/exercises/exercise/${id}`,exerciseOptions);
        setExerciseDetail(exerciseDetailData);
        
        const exerciseVideoData = await fetchData(`${youtubeSearchUrl}/search?query=${exerciseDetailData.name}`,youtubeOption);
        setExerciseVideo(exerciseVideoData.contents);
        
        const targetMuscleExericses = await fetchData(` ${exerciseDbUrl}/exercises/target/${exerciseDetailData.target}`, exerciseOptions)
        setTargetMuscleVideo(targetMuscleExericses);

        const equipmentExericses= await fetchData(` ${exerciseDbUrl}/exercises/equipment/${exerciseDetailData.equipment}`, exerciseOptions)
        setEquipmentVideo(equipmentExericses);
    }
    fetchExercisesData();
  }, [id])
  
  return (
    <Box>
      <Detail exerciseDetail={exerciseDetail}/>
      <ExercisesVideo exerciseVideo={exerciseVideo} name={exerciseDetail.name}/>
      <SimilairExercises targetMuscleVideo={targetMuscleVideo} equipmentExericses={equipmentVideo}/>
    </Box>
  )
}

export default ExerciseDetail