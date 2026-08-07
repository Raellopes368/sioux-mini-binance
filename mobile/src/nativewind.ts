import { ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';

cssInterop(SafeAreaView, { className: 'style' });
cssInterop(ImageBackground, { className: 'style' });
cssInterop(BlurView, { className: 'style' });
