import React, { useMemo } from "react";
import ImageCollage, { ImageCollageItem } from "../ImageCollage";
import { useImageFromPool } from "@/components/ImagePool/ImagePoolProvider";

type Props = {};

const LandingCollageImageLayout = (props: Props) => {
  const imgLeftTop = useImageFromPool("landing-left-top");
  const imgLeftMiddle = useImageFromPool("landing-left-middle");
  const imgLeftBottom = useImageFromPool("landing-left-bottom");
  const imgRightTop = useImageFromPool("landing-right-top");
  const imgRightMiddle = useImageFromPool("landing-right-middle");
  const imgRightBottom = useImageFromPool("landing-right-bottom");

  return (
    <ImageCollage>
      {/* left items */}
      <ImageCollageItem
        width={25}
        left={-5}
        top={40}
        rotation={8}
        entrance="left"
      >
        {imgLeftMiddle}
      </ImageCollageItem>
      <ImageCollageItem
        width={15}
        left={2}
        top={8}
        rotation={-3}
        entrance="left"
      >
        {imgLeftTop}
      </ImageCollageItem>
      <ImageCollageItem
        width={18}
        left={-1}
        top={64}
        rotation={-10}
        entrance="left"
      >
        {imgLeftBottom}
      </ImageCollageItem>
      {/* right items */}
      <ImageCollageItem
        width={15}
        right={-2}
        top={8}
        rotation={-5}
        entrance="right"
      >
        {imgRightTop}
      </ImageCollageItem>

      <ImageCollageItem
        width={16}
        right={-4}
        top={50}
        rotation={6}
        entrance="right"
      >
        {imgRightBottom}
      </ImageCollageItem>
      <ImageCollageItem
        width={18}
        right={-2}
        top={35}
        rotation={-10}
        entrance="right"
      >
        {imgRightMiddle}
      </ImageCollageItem>
    </ImageCollage>
  );
};

export default LandingCollageImageLayout;
