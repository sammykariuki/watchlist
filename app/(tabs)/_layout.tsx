import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { Tabs } from "expo-router";
import { Image, ImageBackground, Text } from "react-native";

export function TabIcon() {
  return (
    <ImageBackground
      source={images.highlight}
      className="flex flex-row w-full flex-1 min-w-[112px] min-h-14 mt-4 justify-center items-center rounded-full overflow-hidden"
    >
      <Image source={icons.home} tintColor="#151312" className="size-5" />
      <Text className="text-secondary text-base font-semibold ml-2">Home</Text>
    </ImageBackground>
  );
}
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{ title: "Saved", headerShown: false }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: "Search", headerShown: false }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", headerShown: false }}
      />
    </Tabs>
  );
}
