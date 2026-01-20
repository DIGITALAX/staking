import {
  COLORS,
  DESCRIPTIVE,
  DESIGNTOOLS,
  ENGINES,
  EQUIPMENT,
  FASHION,
  FORMAT,
  GENRE,
  LIGHTNING,
  STYLE,
  TECHNIQUES,
} from "@/app/lib/constants";
import { useState } from "react";

const usePoolSearch = () => {
  const [topic, setTopic] = useState<string>("in the style of");
  const topicValues: { [key: string]: string[] } = {
    "in the style of": STYLE,
    genre: GENRE,
    format: FORMAT,
    colors: COLORS,
    lighting: LIGHTNING,
    engines: ENGINES,
    "design tools": DESIGNTOOLS,
    techniques: TECHNIQUES,
    fashion: FASHION,
    equipment: EQUIPMENT,
    descriptive: DESCRIPTIVE,
  };

  return {
    topic,
    setTopic,
    topicValues,
  };
};

export default usePoolSearch;
