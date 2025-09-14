import React, { useCallback } from "react";
import { View, Text, Button, Image } from "@tarojs/components";
import { useEnv, useNavigationBar, useModal, useToast } from "taro-hooks";
import logo from "./hook.png";

import './index.less'

const Index = () => {
  const env = useEnv();
  const { setTitle } = useNavigationBar({ title: "Taro Hooks" });
  const showModal = useModal({
    title: "Taro Hooks Canary!",
    showCancel: false,
    confirmColor: "#8c2de9",
    confirmText: "支持一下"
  });
  const { show } = useToast({ mask: true });

  const handleModal = useCallback(() => {
    showModal({ content: "不如给一个star⭐️!" }).then(() => {
      show({ title: "点击了支持!" });
    });
  }, [show, showModal]);

  return (
    <View className="wrapper p-4 bg-gray-50 min-h-screen">
      <Image className="logo mx-auto block w-20 h-20" src={logo} />
      <Text className="title text-2xl font-bold text-center text-gray-800 mt-4 block">为Taro而设计的Hooks Library</Text>
      <Text className="desc text-gray-600 text-center mt-2 leading-relaxed block">
        目前覆盖70%官方API. 抹平部分API在H5端短板. 提供近40+Hooks!
        并结合ahook适配Taro! 更多信息可以查看新版文档: https://next-version-taro-hooks.vercel.app/
      </Text>
      <View className="list card mt-6">
        <Text className="label text-sm font-medium text-gray-700 block">运行环境</Text>
        <Text className="note text-primary-600 font-semibold block">{env}</Text>
      </View>
      <Button className="btn-primary mt-4 w-full" onClick={() => setTitle("Taro Hooks Nice!")}>
        设置标题
      </Button>
      <Button className="btn-secondary mt-3 w-full" onClick={handleModal}>
        使用Modal
      </Button>
    </View>
  );
};

export default Index;
