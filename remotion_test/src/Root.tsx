import "./index.css";
import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { HowAIWorks } from "./HowAIWorks";
import { defaultHowAIWorksProps, howAIWorksSchema } from "./HowAIWorks/types";
import { HowAIWorks3B1B } from "./ThreeBlueOneBrown";
import { defaultThreeB1BProps, threeB1BSchema } from "./ThreeBlueOneBrown/types";
import { TitanShowcase } from "./TitanShowcase";
import { defaultTitanXProps, titanXSchema } from "./TitanShowcase/types";
import { HowAIWorksVox } from "./VoxStyle";
import { defaultVoxProps, voxSchema } from "./VoxStyle/types";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 60-second 9:16 Vox Editorial Explainer Style */}
      <Composition
        id="HowAIWorksVox"
        component={HowAIWorksVox}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        schema={voxSchema}
        defaultProps={defaultVoxProps}
      />

      {/* 60-second 9:16 3Blue1Brown Mathematical Manim Style */}
      <Composition
        id="HowAIWorks3B1B"
        component={HowAIWorks3B1B}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        schema={threeB1BSchema}
        defaultProps={defaultThreeB1BProps}
      />

      {/* 60-second 9:16 Cyber / HUD Motion Graphics Style */}
      <Composition
        id="HowAIWorks"
        component={HowAIWorks}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        schema={howAIWorksSchema}
        defaultProps={defaultHowAIWorksProps}
      />

      {/* 15-second cinematic Apple-style tech launch showcase */}
      <Composition
        id="TitanX"
        component={TitanShowcase}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
        schema={titanXSchema}
        defaultProps={defaultTitanXProps}
      />

      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          logoColor1: "#91dAE2",
          logoColor2: "#86A8E7",
        }}
      />
    </>
  );
};
