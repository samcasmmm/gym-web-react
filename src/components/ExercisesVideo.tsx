import React from "react";
import { Box, Stack, Typography } from "@mui/material";

const ExercisesVideo = ({ exerciseVideo, name }) => {
  if (!exerciseVideo.length) return "Loading..";
  return (
    <Box sx={{ marginTop: { lg: "200px", xs: "20px" } }} p="20px">
      <Typography variant="h4" mb="33px">
        Watch{" "}
        <strong style={{ color: "#FF2625", textTransform: "capitalize" }}>
          {name}
        </strong>{" "}
        Exercise Videos
      </Typography>

      <Stack
        justifyContent="flex-start"
        flexWrap="wrap"
        alignItems="center"
        sx={{
          flexDirection: { lg: "row" },
          gap: { lg: "110px", xs: "0" },
        }}
      >
        {exerciseVideo?.slice(0, 6).map((item, index) => (
          <a
            key={index}
            className="exercises-video"
            href={`https://www.youtube.com/watch?v=${item.video.videoId}`}
            target="_blank"
            rel="noreferrer "
          >
            <img src={item.video.thumbnails[0].url} alt={item.title} />
            <Box wordWrap="break-word">
              <Typography variant="h5" color="black">
                {item.video.title}
              </Typography>
              <Typography variant="h6" color="black">
                {item.video.channelName}
              </Typography>
            </Box>
          </a>
        ))}
      </Stack>
    </Box>
  );
};

export default ExercisesVideo;
