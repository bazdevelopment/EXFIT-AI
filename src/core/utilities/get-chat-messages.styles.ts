type Message = {
  isError: boolean;
};

type Colors = {
  danger: Record<number, string>;
  white: string;
  charcoal: Record<number, string>;
};

type StyleObject = Record<string, React.CSSProperties>;

export function getChatMessagesStyles(
  message: Message,
  isUser: boolean,
  colors: Colors
): {
  lightStyles: StyleObject;
  darkStyles: StyleObject;
} {
  const baseTextColor = message.isError ? colors.danger[800] : colors.white;

  const darkTextColor = message.isError ? colors.danger[800] : colors.white;

  const lightStyles: StyleObject = {
    body: {
      marginTop: -7,
      marginBottom: -7,
      fontSize: 14,
      lineHeight: 22,
      color: baseTextColor,
    },
    heading1: {
      color: baseTextColor,
      fontSize: 24,
      fontWeight: 'bold',
    },
    heading2: {
      color: baseTextColor,
      fontSize: 20,
      fontWeight: 'bold',
    },
    heading3: {
      color: baseTextColor,
      fontSize: 18,
      fontWeight: 'bold',
    },
    paragraph: {
      fontFamily: 'Font-Medium',
      fontSize: 14,
      marginBottom: 8,
    },
    list_item: {
      fontFamily: 'Font-Medium',
      fontSize: 14,
      marginBottom: 6,
    },
    span: {
      fontFamily: 'Font-Medium',
      fontSize: 14,
    },
    strong: {
      fontFamily: 'Font-Extra-Bold',
      fontWeight: '800',
      color: '#3195FD', // Highlight bold text with a strong color like amber
    },
    em: {
      fontFamily: 'Font-Extra-Bold',
      color: colors.white, // Slightly muted color for italics to differentiate
    },
    blockquote: {
      borderLeftWidth: 4,
      paddingLeft: 10,
      color: '#4B5563',
      fontStyle: 'italic',
    },
    code_inline: {
      // backgroundColor: '#F3F4F6',
      borderRadius: 4,
      fontFamily: 'Font-Mono',
      fontSize: 13,
      color: '#111827',
    },
  };

  const darkStyles: StyleObject = {
    body: {
      marginTop: -7,
      marginBottom: -7,
      fontSize: 14,
      lineHeight: 22,
      color: darkTextColor,
    },
    heading1: {
      fontFamily: 'Font-Extra-Bold',
      color: darkTextColor,
    },
    heading2: {
      fontFamily: 'Font-Extra-Bold',
      fontWeight: '800',
    },
    paragraph: {
      fontFamily: 'Font-Medium',
    },
    list_item: {
      fontFamily: 'Font-Medium',
    },
    span: {
      fontFamily: 'Font-Medium',
    },
    strong: {
      fontFamily: 'Font-Extra-Bold',
      fontWeight: '800',
    },
    em: {
      fontFamily: 'Font-Medium',
      fontStyle: 'italic',
    },
  };

  return { lightStyles, darkStyles };
}
