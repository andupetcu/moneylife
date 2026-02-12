// Type declarations for react-native-web compatibility
// When Next.js resolves 'react-native' → 'react-native-web',
// we need proper type support

declare module 'react-native' {
  import type { ComponentType } from 'react';

  export const View: ComponentType<any>;
  export const Text: ComponentType<any>;
  export const TouchableOpacity: ComponentType<any>;
  export const ScrollView: ComponentType<any>;
  export const TextInput: ComponentType<any>;
  export const Image: ComponentType<any>;
  export const ActivityIndicator: ComponentType<any>;
  export const Modal: ComponentType<any>;
  export const Pressable: ComponentType<any>;
  export const FlatList: ComponentType<any>;
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
    flatten: (...styles: any[]) => any;
    absoluteFill: any;
    hairlineWidth: number;
  };
  export const Animated: any;
  export const Dimensions: {
    get: (dim: 'window' | 'screen') => { width: number; height: number };
    addEventListener: (type: string, handler: any) => any;
  };
  export const Platform: {
    OS: 'ios' | 'android' | 'web';
    select: <T>(specifics: { ios?: T; android?: T; web?: T; default?: T }) => T;
  };
  export const Linking: {
    openURL: (url: string) => Promise<void>;
    canOpenURL: (url: string) => Promise<boolean>;
  };
  export const Alert: {
    alert: (title: string, message?: string, buttons?: any[], options?: any) => void;
  };
  export const Switch: ComponentType<any>;
  export const KeyboardAvoidingView: ComponentType<any>;

  export type ViewStyle = Record<string, any>;
  export type TextStyle = Record<string, any>;
  export type ImageStyle = Record<string, any>;
  export type ColorValue = string;
  export type DimensionValue = number | string;
}
