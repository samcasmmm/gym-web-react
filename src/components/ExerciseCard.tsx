import React from "react";
import { Link } from "react-router-dom";
import { Button, Stack, Typography } from "@mui/material";
import "../App.css";

const ExerciseCard = ({ exercise }) => {
  return (
    <Link className="exercise-card" to={`/exercise/${exercise.id}`}>
      <img src={exercise.gifUrl} alt={exercise.name} Loading="lazy" />
      <Stack direction="row">
        <Button
          sx=
          {{
            ml: "20px",
            color: "#fff",
            background: "#ffa9a9",
            fontSize: "14px",
            borderRadius: "20px",
            textTransform: "capitalize",
            padding: "5px"
          }}
          >{exercise.bodyPart}
        </Button>
        <Button
          sx=
          {{
            ml: "20px",
            color: "#fff",
            background: "#fcc757",
            fontSize: "14px",
            borderRadius: "20px",
            textTransform: "capitalize",
            padding: "5px"
          }}
          >{exercise.target}
        </Button>
      </Stack>
      <Typography ml='21px' color='#000' fontWeight="bold" mt="11px" padding='5px 5px 10px 8px'
      pb="10px" textTranform="capitalize" fontSize="18px">{exercise.name}</Typography>
    </Link>
  );
};

export default ExerciseCard;
