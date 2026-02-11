/* eslint-disable max-lines-per-function */
/* eslint-disable react-hooks/exhaustive-deps */

import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Toaster } from 'sonner-native';
import { twMerge } from 'tailwind-merge';

import {
  useAllUserConversations,
  useConversationHistory,
  useSendStreamingMessage,
} from '@/api/conversation/conversation.hooks';
import { useUser } from '@/api/user/user.hooks';
import AnimatedChatQuestions from '@/components/animted-chat-questions';
import AttachmentPreview from '@/components/attachment-preview';
import BounceLoader from '@/components/bounce-loader';
import Branding from '@/components/branding';
import ChatBubble from '@/components/chat-bubble';
import CustomAlert from '@/components/custom-alert';
import Icon from '@/components/icon';
import { ImagePickerModal } from '@/components/image-picker-modal';
import ImagePreviewGallery from '@/components/image-preview-gallery';
import ScreenWrapper from '@/components/screen-wrapper';
import Toast from '@/components/toast';
import TypingIndicator from '@/components/typing-indicator';
import { colors, Image, Text } from '@/components/ui';
import { ArrowLeft, SendIcon } from '@/components/ui/assets/icons';
import { AddMediaPicker } from '@/components/ui/assets/icons/add-media-picker';
import { LOADING_MESSAGES_CHATBOT } from '@/constants/loading-messages';
import { DEVICE_TYPE, translate, useSelectedLanguage } from '@/core';
import useBackHandler from '@/core/hooks/use-back-handler';
import { useMediaPickerChat } from '@/core/hooks/use-media-picker-chat';
import useRemoteConfig from '@/core/hooks/use-remote-config';
import useSubscriptionAlert from '@/core/hooks/use-subscription-banner';
import { useTextToSpeech } from '@/core/hooks/use-text-to-speech';
import { checkIsVideo } from '@/core/utilities/check-is-video';
import { generateUniqueId } from '@/core/utilities/generate-unique-id';
import { shuffleArray } from '@/core/utilities/shuffle-array';
import { wait } from '@/core/utilities/wait';

type MessageType = {
  role: string;
  content: string;
  isPending?: boolean;
  isError?: boolean;
  imageUrls?: string[];
};

const RANDOM_QUESTIONS = [
  translate('rootLayout.screens.chat.randomQuestions.one'),
  translate('rootLayout.screens.chat.randomQuestions.two'),
  translate('rootLayout.screens.chat.randomQuestions.three'),
  translate('rootLayout.screens.chat.randomQuestions.four'),
  translate('rootLayout.screens.chat.randomQuestions.five'),
  translate('rootLayout.screens.chat.randomQuestions.six'),
  translate('rootLayout.screens.chat.randomQuestions.seven'),
  translate('rootLayout.screens.chat.randomQuestions.eight'),
  translate('rootLayout.screens.chat.randomQuestions.nine'),
  translate('rootLayout.screens.chat.randomQuestions.ten'),
  translate('rootLayout.screens.chat.randomQuestions.eleven'),
  translate('rootLayout.screens.chat.randomQuestions.twelve'),
  translate('rootLayout.screens.chat.randomQuestions.thirteen'),
  translate('rootLayout.screens.chat.randomQuestions.fourteen'),
  translate('rootLayout.screens.chat.randomQuestions.fifteen'),
];

const ChatScreen = () => {
  const {
    conversationId = generateUniqueId(),
    mediaSource,
    mimeType,
    conversationMode,
    question,
  } = useLocalSearchParams();
  const [randomQuestions, setRandomQuestions] = useState<string[]>([]);

  const [userMessage, setUserMessage] = useState('');
  const [pendingMessages, setPendingMessages] = useState<MessageType[]>([]);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(
    null
  );
  const [lastUserMessageIndex, setLastUserMessageIndex] = useState<
    number | null
  >(null);
  const isVideo = checkIsVideo(mimeType as string);

  const flashListRef = useRef<FlashList<MessageType>>(null);

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
  } = useTextToSpeech({
    preferredGender: 'female',
  });

  const { data, isPending: isFetchingAllConversationsPending } =
    useAllUserConversations();
  const { language: appLanguage } = useSelectedLanguage();

  const conversationsCount = data?.count || 0;

  const {
    BLURRING_CONTENT_CONVERSATIONS_LIMIT,
    MAX_CONVERSATIONS_ALLOWED_FREE_TRIAL,
  } = useRemoteConfig();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { language } = useSelectedLanguage();
  const { data: userInfo } = useUser(language);

  const { data: conversation, isLoading } = useConversationHistory(
    conversationId as string
  );

  const [isVisible, setVisible] = useState(false);

  const showPicker = () => setVisible(true);
  const closePicker = () => setVisible(false);

  const handleUnlockMessage = () => {
    router.navigate('/paywall-new');
  };

  const {
    onChooseImageFromGallery,
    onChooseFromFiles,
    onTakePhoto,
    files,
    onRemoveFile,
    onResetFiles,
  } = useMediaPickerChat({ onCloseModal: closePicker });
  const { isUpgradeRequired } = useSubscriptionAlert();

  const {
    mutateAsync: sendStreamingMessage,
    isPending: isPendingStreamingMessage,
  } = useSendStreamingMessage({ onComplete: onResetFiles });

  const handleSpeak = (messageId: string, text: string) => {
    if (currentlySpeakingId === messageId) {
      setCurrentlySpeakingId(null);
      speak(text);
      wait(50).then(() => stopSpeaking()); //hack to be able to stop the speech when navigating throught different messages
    } else {
      setCurrentlySpeakingId(messageId);
      stopSpeaking();
      speak(text);
    }
  };

  const handleSendMessage = async (userMsg) => {
    if (!userMsg.trim() && !files?.length) return;
    setUserMessage('');
    Keyboard.dismiss();

    // Convert files to MediaFile format
    const mediaFiles = files?.map((file) => ({
      uri: file?.fileUri || file?.uri || '',
      type: file?.type || '',
      mimeType: file?.mimeType || '',
    }));

    // Add the message to pending messages
    const newMessage: MessageType = {
      role: 'user',
      content: !!userMsg?.trim()
        ? userMsg
        : !!mediaFiles?.length
          ? translate('general.analyzingMediaFilesPlaceholder')
          : '',
      isPending: true,
      imageUrls: mediaFiles.map((img) => img.uri),
    };

    setPendingMessages((prev) => [...prev, newMessage]);

    // Store the index of the user's message
    setLastUserMessageIndex(messages?.length);

    try {
      await sendStreamingMessage({
        userMessage: !!userMsg?.trim()
          ? userMsg
          : !!mediaFiles?.length
            ? translate('general.analyzingMediaFilesPlaceholder')
            : '',
        conversationId: conversationId as string,
        userId: userInfo.userId,
        history: conversation?.messages || [],
        mediaFiles,
        language: appLanguage,
        onStream: (chunk: string) => {},
        onComplete: (fullResponse: string) => {
          onResetFiles?.();
        },
        onError: (error: Error) => {
          // console.error('Error sending message:', error);
          Toast.error(translate('alerts.chatMessageNotSent'));
        },
      });
      // Remove the pending message and add it to the conversation
      setPendingMessages((prev) =>
        prev.filter((msg) => msg.content !== newMessage.content)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark the message as failed
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.content === newMessage.content
            ? { ...msg, isPending: false, isError: true }
            : msg
        )
      );
    }
  };

  const handleRetryMessage = async (message: MessageType) => {
    try {
      // Mark the message as pending again
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.content === message.content
            ? {
                ...msg,
                isPending: true,
                isError: false,
                imageUrls: mediaFiles?.map((img) => img.uri),
              }
            : msg
        )
      );

      const mediaFiles = files?.map((file) => ({
        uri: file?.fileUri || file?.uri || '',
        type: file?.type || '',
        mimeType: file?.mimeType || '',
      }));

      await sendStreamingMessage({
        userMessage: message.content
          ? message.content
          : mediaFiles?.length
            ? translate('general.analyzingMediaFilesPlaceholder')
            : '',
        conversationId: conversationId as string,
        userId: userInfo.userId,
        history: conversation?.messages || [],
        mediaFiles,
        language: appLanguage,
        onStream: (chunk: string) => {},
        onComplete: (fullResponse: string) => {
          onResetFiles?.();
        },
        onError: (error: Error) => {
          // console.error('Error sending message:', error);
          Toast.error(translate('alerts.failedSendMessage'));
        },
      });
      // Remove the pending message and add it to the conversation
      setPendingMessages((prev) =>
        prev.filter((msg) => msg.content !== message.content)
      );
    } catch (error) {
      // console.error('Error retrying message:', error);
      // Mark the message as failed again
      setPendingMessages((prev) =>
        prev.map((msg) =>
          msg.content === message.content
            ? {
                ...msg,
                isPending: false,
                isError: true,
              }
            : msg
        )
      );
    }
  };

  // Combine conversation messages and pending messages
  interface ConversationMessage {
    role: string;
    content: string;
  }
  const messages: MessageType[] = useMemo(
    () => [
      ...(conversation?.messages?.filter(
        (msg: ConversationMessage) => !Array.isArray(msg.content)
      ) || []),
      ...pendingMessages,
    ],
    [conversation?.messages, pendingMessages]
  );

  useBackHandler(() => true);

  useEffect(() => {
    if (question) {
      handleSendMessage(question);
    }
  }, [question]);

  useEffect(() => {
    if (conversationMode === 'RANDOM_CONVERSATION') {
      setRandomQuestions(shuffleArray(RANDOM_QUESTIONS).slice(0, 5));
    }
  }, [conversationMode]);

  // Scroll logic based on the number of messages
  useEffect(() => {
    if (messages.length && flashListRef.current) {
      setTimeout(() => {
        if (lastUserMessageIndex !== null) {
          // Scroll to the user's question
          flashListRef.current?.scrollToIndex({
            index: lastUserMessageIndex,
            animated: true,
            viewPosition: 0, // Align the top of the item with the top of the list
          });
        } else {
          // If there's only one message, scroll to the top
          flashListRef.current?.scrollToOffset({
            offset: 0,
            animated: true,
          });
        }
      }, 100);
    }
  }, [messages.length, lastUserMessageIndex]);

  // Scroll to bottom when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        flashListRef.current?.scrollToOffset({
          offset: 100000,
          animated: true,
        });
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  if (isLoading && conversationMode !== 'RANDOM_CONVERSATION') {
    return (
      <View className="flex-1 items-center justify-center bg-black dark:bg-blackEerie">
        <Branding imageClassname="size-[90px]" isLogoVisible invertedColors />
        <ActivityIndicator
          size="large"
          className="my-6 items-center justify-center"
          color={isDark ? colors.charcoal[300] : colors.charcoal[100]}
        />
        <BounceLoader
          loadingMessages={LOADING_MESSAGES_CHATBOT}
          textClassName="text-black dark:text-white"
        />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      {DEVICE_TYPE.IOS && (
        <Toaster autoWiggleOnUpdate="toast-change" pauseWhenPageIsHidden />
      )}
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={DEVICE_TYPE.ANDROID ? 40 : 0}
      >
        {/* <ScrollView
          contentContainerClassName="flex-1"
          keyboardShouldPersistTaps="handled"
        > */}
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <Icon
            icon={<ArrowLeft color={colors.white} />}
            iconContainerStyle="items-center p-2.5 self-start rounded-full border-2 border-charcoal-800"
            size={24}
            color={colors.white}
            onPress={() => {
              stopSpeaking();
              router.push('/(app)/');
            }}
          />

          <View className="ml-3 flex-row items-center">
            <View className="mr-3 items-center justify-center rounded-full">
              <Image
                source={require('../components/ui/assets/images/fit-character-training-2.png')}
                className="size-[40] rounded-full"
              />
            </View>
            <View>
              <Text className="font-medium-poppins text-lg text-white">
                {`Mojo - ${translate('rootLayout.screens.chat.fitnessCoach')}`}
              </Text>
              <View className="flex-row items-center gap-2">
                <View className="size-2 rounded-full bg-success-400" />
                {isPendingStreamingMessage ? (
                  <Text className="text-xs text-white">
                    {translate('general.typing')}
                  </Text>
                ) : (
                  <Text className="font-medium-poppins text-xs text-white">
                    {translate('general.online')}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View className="flex-1 items-end justify-end">
            {!!mediaSource && (
              <AttachmentPreview
                filePath={mediaSource as string}
                isVideo={isVideo}
                className="size-[40px] rounded-xl border-0"
                isEntirelyClickable
              />
            )}
          </View>
        </View>
        {conversationMode === 'RANDOM_CONVERSATION' &&
          !pendingMessages.length &&
          !conversation &&
          !!randomQuestions.length && (
            <ScrollView
              contentContainerClassName="h-[90%] justify-end"
              keyboardShouldPersistTaps="handled"
            >
              <AnimatedChatQuestions
                questions={randomQuestions}
                onSelect={(question) => {
                  if (
                    isUpgradeRequired &&
                    conversationsCount >= MAX_CONVERSATIONS_ALLOWED_FREE_TRIAL
                  ) {
                    return Toast.showCustomToast(
                      <CustomAlert
                        title={translate('general.attention')}
                        subtitle={translate('alerts.chatAndMediaFilesLimit')}
                        buttons={[
                          {
                            label: translate(
                              'components.UpgradeBanner.heading'
                            ),
                            variant: 'default',
                            onPress: () =>
                              wait(500).then(() =>
                                router.navigate('/paywall-new')
                              ),
                            buttonTextClassName: 'dark:text-white',
                            className:
                              'flex-1 rounded-xl h-[48] bg-primary-900 active:opacity-80 dark:bg-primary-900',
                          },
                        ]}
                      />,
                      {
                        position: 'middle',
                        duration: Infinity,
                      }
                    );
                  }
                  handleSendMessage(question);
                }}
              />
            </ScrollView>
          )}

        {/* Messages List */}
        <FlashList
          ref={flashListRef}
          data={messages}
          keyboardShouldPersistTaps="handled"
          extraData={[
            isSpeaking,
            isUpgradeRequired,
            conversationsCount,
            isPendingStreamingMessage,
          ]} //triggers a reset          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: 8,
          }}
          renderItem={({ item, index }) => {
            const isAssistantMessage = item.role !== 'user';
            const isFreeTrialLimitReached =
              isUpgradeRequired &&
              conversationsCount >= BLURRING_CONTENT_CONVERSATIONS_LIMIT;

            const shouldBlurMessage =
              isFreeTrialLimitReached && isAssistantMessage && index >= 1;
            return (
              <ChatBubble
                message={item}
                isUser={item.role === 'user'}
                onRetrySendMessage={() => handleRetryMessage(item)}
                speak={(text) => handleSpeak(index.toString(), text)}
                isSpeaking={currentlySpeakingId === index.toString()}
                userGender={userInfo.onboarding.gender}
                shouldBlur={shouldBlurMessage}
                onUnlock={handleUnlockMessage}
              />
            );
          }}
          estimatedItemSize={100}
          ListFooterComponent={
            isPendingStreamingMessage ? <TypingIndicator /> : null
          }
        />
        {/* File Preview */}
        {!!files?.length && !isPendingStreamingMessage && (
          <ImagePreviewGallery files={files} onRemoveFile={onRemoveFile} />
        )}
        {/* Input Area */}
        <View className="flex-row border-t border-gray-200 bg-white px-4 pb-2 pt-4 dark:border-blackEerie dark:bg-transparent">
          <View
            className={`flex-1 flex-row items-center rounded-full border-2 border-primary-900/60 bg-gray-100 px-4 py-1.5 dark:bg-transparent ${userMessage?.length > 30 && 'rounded-lg'}`}
          >
            <Icon
              icon={<AddMediaPicker />}
              size={30}
              color={colors.white}
              containerStyle="-left-2 border-white border-[1.5px] rounded-full"
              onPress={() => {
                if (
                  isUpgradeRequired &&
                  conversationsCount >= MAX_CONVERSATIONS_ALLOWED_FREE_TRIAL
                ) {
                  return Toast.showCustomToast(
                    <CustomAlert
                      title={translate('general.attention')}
                      subtitle={translate('alerts.chatAndMediaFilesLimit')}
                      buttons={[
                        {
                          label: translate('components.UpgradeBanner.heading'),
                          variant: 'default',
                          onPress: () =>
                            wait(500).then(() =>
                              router.navigate('/paywall-new')
                            ),
                          buttonTextClassName: 'dark:text-white',
                          className:
                            'flex-1 rounded-xl h-[48] bg-primary-900 active:opacity-80 dark:bg-primary-900',
                        },
                      ]}
                    />,
                    {
                      position: 'middle',
                      duration: Infinity,
                    }
                  );
                }
                showPicker();
              }}
            />

            <TextInput
              className="flex-1 py-3 text-base text-gray-800 dark:text-white"
              value={userMessage}
              onChangeText={setUserMessage}
              placeholder={translate('general.chatbotPlaceholder')}
              placeholderTextColor={
                isDark ? colors.charcoal[200] : colors.charcoal[800]
              }
              multiline
              maxLength={5000}
            />

            <TouchableOpacity
              onPress={() => {
                if (
                  isUpgradeRequired &&
                  conversationsCount >= MAX_CONVERSATIONS_ALLOWED_FREE_TRIAL
                ) {
                  /**
                   * isFirstTime is used to check if the user installs the app for the first time
                   * usually this variable is set to false after first onboarding, but if the first onboarding is not shown again after reinstallation, the thi variable will remain to true
                   * thats why we need to set it to false based on an action instead of creating another useEffect in layout
                   *  */
                  return Toast.showCustomToast(
                    <CustomAlert
                      title={translate('general.attention')}
                      subtitle={translate('alerts.chatAndMediaFilesLimit')}
                      buttons={[
                        {
                          label: translate('components.UpgradeBanner.heading'),
                          variant: 'default',
                          onPress: () =>
                            wait(500).then(() =>
                              router.navigate('/paywall-new')
                            ),
                          buttonTextClassName: 'dark:text-white',
                          className:
                            'flex-1 rounded-xl h-[48] bg-primary-900 active:opacity-80 dark:bg-primary-900',
                        },
                      ]}
                    />,
                    {
                      position: 'middle',
                      duration: Infinity,
                    }
                  );
                }

                handleSendMessage(userMessage);
              }}
              disabled={
                isPendingStreamingMessage ||
                isFetchingAllConversationsPending ||
                (!userMessage.trim() && !files?.length)
              }
              className={twMerge(
                'ml-2 p-2 rounded-full',
                userMessage.trim() || !!files?.length
                  ? 'bg-blue-500 dark:bg-primary-900'
                  : 'bg-gray-300 dark:bg-charcoal-400'
              )}
            >
              <SendIcon />
            </TouchableOpacity>
          </View>
        </View>
        {/* </ScrollView> */}
      </KeyboardAvoidingView>
      <ImagePickerModal
        title=""
        data={['Select from the library', 'Take a picture', 'Choose file']}
        isVisible={isVisible}
        onCancelPress={closePicker}
        onBackdropPress={closePicker}
        onPress={(item) => {}}
        onChooseImageFromGallery={onChooseImageFromGallery}
        onChooseFromFiles={onChooseFromFiles}
        onTakePhoto={onTakePhoto}
      />
    </ScreenWrapper>
  );
};

export default ChatScreen;
