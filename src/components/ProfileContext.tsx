import React, { useContext, useState } from "react";
import { useRouteMatch } from "react-router";
import { pxgLib } from "../pxg-lib";
import { AvatarType } from "pxg-js";
import { Web3Context } from "../Web3Provider";
// @ts-ignore
import namehash from "eth-ens-namehash";
import { REQUEST_URL } from "../pxg-lib/constants";

type ProfileDataType = {
  owner: string;
  avatar?: AvatarType;
  label?: string;
};

type ProfileNftsType = NFTFromCyber[];

export const ProfileContext = React.createContext<{
  data: ProfileDataType | null;
  nfts?: ProfileNftsType | null;
  exhibitId?: string;
  loading: boolean;
  exhibitsLoading: boolean;
  allGalleries?: CyberExhibit[] | null;
  getGallery?: any;
  links?: LinkType[] | null;
}>({
  links: null,
  data: null,
  nfts: null,
  allGalleries: null,
  loading: true,
  exhibitsLoading: true,
});

export type NFTFromCyber = {
  collection: {
    external_url: string;
    name: string;
    image_url: string;
  };
  owner: {
    address: string;
  };
  creator?: {
    address: string;
  };
  // Opensea
  ownership?: {
    owner: {
      address: string;
    };
  };
  name: string;
  image_url: string;
  description: string;
  token_id: string;
  contract_address: string;
  token_address: string;
  permalink: string;
};

type CyberExhibit = {
  id: string;
  artworks: any;
  info: {
    headline: string;
    heroImg: string;
  };
  owner: string;
};

export type LinkType = {
  category: "collection" | "social";
  key: string;
  value: string;
};

function ProfileProvider({ children }: { children: React.ReactNode }) {
  const context = useContext(Web3Context);
  const match = useRouteMatch<{ name: string }>();
  const [data, updateData] = useState<ProfileDataType | null>(null);
  const [nfts, updateNfts] = useState<NFTFromCyber[]>();
  const [exhibitId, updateExhibitId] = useState<string>();
  const [allGalleries, updateAllGalleries] = useState<CyberExhibit[]>();
  const [links, updateLinks] = useState<LinkType[]>();
  const [loading, updateLoading] = useState(true);
  const [exhibitsLoading, updateExhibitsLoading] = useState(true);

  const getGallery = async () => {
    const { gallery } = await pxgLib.getDefaultGallery(match.params.name);
    if (gallery?.id) {
      updateExhibitId(gallery?.id);
    }
    if (gallery?.artworks) {
      const nfts = Object.values(gallery.artworks).map(
        (item: any) => item.data
      );
      updateNfts(nfts);
    }
    updateExhibitsLoading(false);
    updateLoading(false);
  };

  React.useEffect(() => {
    const getAllGalleries = async () => {
      const data = await fetch(
        `https://cyber-jfl9w.ondigitalocean.app/experiences/user/${pxgLib.accounts?.[0].toLowerCase()}`
      ).then((res) => res.json());
      if (data?.success) {
        updateAllGalleries(
          data.exhibits.filter(
            (item: any) =>
              item.owner.toLowerCase() === pxgLib.accounts?.[0].toLowerCase()
          )
        );
      }
    };
    const getData = async () => {
      let owner = "";
      let currentLinks;
      let avatar: AvatarType;

      const data = await fetch(
        `${REQUEST_URL}/pxg/profile/${match.params.name}`
      ).then((res) => res.json());

      ({ owner, currentLinks, avatar } = data);

      try {
        if (owner === pxgLib.constants.ZERO_ADDRESS) {
          owner = "";
        }
        if (!owner) {
          updateLoading(false);
        }
        if (owner) {
          if (owner.toLowerCase() === pxgLib.accounts?.[0].toLowerCase()) {
            getAllGalleries();
          }
          updateLinks(currentLinks);
          getGallery();
        }
      } catch (e) {
        if (e.message.includes("owner query for nonexistent token")) {
          // can register token
        } else {
          // maybe can register name
        }
        console.log("error", e.message);
      }

      updateData((data) => ({
        ...(data ?? {}),
        owner,
        avatar,
        label: namehash.normalize(`${match.params.name}`),
      }));
    };

    getData();
  }, [context?.connected, match.params.name]);
  return (
    <ProfileContext.Provider
      value={{
        data,
        nfts,
        loading,
        exhibitsLoading,
        exhibitId,
        allGalleries,
        getGallery,
        links,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export default ProfileProvider;
