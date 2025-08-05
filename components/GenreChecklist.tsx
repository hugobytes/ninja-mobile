import { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Dimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width: screenWidth } = Dimensions.get('window');

const MOVIE_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

const TV_GENRES = [
  'Action & Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
  'Family', 'Fantasy', 'Kids', 'Mystery', 'News', 'Reality',
  'Sci-Fi & Fantasy', 'Soap', 'Talk', 'War & Politics', 'Western'
];

const TROPES = [
  'Coming-of-Age',
  'Slasher',
  'Troubled Genius',
  'Forbidden Love',
  'Detective',
  'Time Travel',
  'Culture Clash',
  'Heist',
  'Revenge',
  'Found Family',
  'Survival',
  'Historical Drama',
  'Based on a True Story',
  'Fish Out of Water',
  'Rags to Riches',
  'One Crazy Night',
  'Road Trip',
  'Apocalyptic',
  'Parallel Realities',
  'Political Intrigue',
  'Sports Underdog',
  'Conspiracy',
  'Based on a Novel'
];

const MOODS = [
  'Uplifting',
  'Nostalgic',
  'Heartfelt',
  'Thought-provoking',
  'Light-hearted',
  'Gripping',
  'Dark',
  'Scary',
  'Tense',
  'Offbeat',
  'Chill',
  'Romantic',
  'Disturbing',
  'Wholesome',
  'Cosy',
  'Melancholic'
];

const ACCLAIMS = [
  'Oscar Winner',
  'Critically Acclaimed',
  'Festival Favorite',
  'Certified Fresh',
  'IMDb Top 250',
  'Loved by Audiences',
  'Cult Classic',
  'Underrated Gem',
  "So Bad It's Good",
  'Viral Hit',
  'Box Office Hit',
  'Flop with a Fanbase',
  'Director’s Masterpiece'
];

const ORIGINS = [
  '50s and older',
  '70s',
  '80s',
  '90s',
  '2000s',
  '2010s',
  '2020s',
  'Set in the Past',
  'Set in the Future',
  'High Budget',
  'Low Budget',
  'International (Non-English)',
  'British',
  'French',
  'USA',
  'South America',
  'Bollywood',
  'Foreign Language',
  'Animated',
  'Live Action',
  'A24',
  'Studio Ghibli',
  'Netflix Original',
  'Based on a Book',
  'Shot on Film',
  'One Location'
];

const CRITERIA_LABELS = ['Genres', 'Tropes', 'Moods', 'Origins', 'Acclaims'];

interface GenreChecklistProps {
  type: 'movie' | 'tv';
  onGenreChange?: (selectedGenres: string[]) => void;
}

export function GenreChecklist({ type, onGenreChange }: GenreChecklistProps) {
  const criterias = type === 'movie' 
    ? [MOVIE_GENRES, TROPES, MOODS, ORIGINS, ACCLAIMS]
    : [TV_GENRES, TROPES, MOODS, ORIGINS, ACCLAIMS];
    
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentCriteriaIndex, setCurrentCriteriaIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const toggleItem = (item: string) => {
    const newSelection = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];
    
    setSelectedItems(newSelection);
    onGenreChange?.(newSelection);
  };

  const removeSelectedItem = (item: string) => {
    const newSelection = selectedItems.filter(i => i !== item);
    setSelectedItems(newSelection);
    onGenreChange?.(newSelection);
  };

  const handleExplore = () => {
    // Group selections by type for API
    const genres = selectedItems.filter(item => criterias[0].includes(item));
    const tropes = selectedItems.filter(item => TROPES.includes(item));
    const moods = selectedItems.filter(item => MOODS.includes(item));
    const origins = selectedItems.filter(item => ORIGINS.includes(item));
    const acclaims = selectedItems.filter(item => ACCLAIMS.includes(item));

    const params: any = { type };
    if (genres.length > 0) params.genres = genres.join(',');
    if (tropes.length > 0) params.tropes = tropes.join(',');
    if (moods.length > 0) params.moods = moods.join(',');
    if (origins.length > 0) params.origins = origins.join(',');
    if (acclaims.length > 0) params.acclaims = acclaims.join(',');

    router.push({
      pathname: '/explore',
      params
    });
  };

  const renderCriteriaPage = (criteria: string[], index: number) => (
    <ThemedView key={index} style={[styles.criteriaPage, { width: screenWidth }]}>
      <ThemedView style={styles.criteriaHeader}>
        <ThemedText style={[styles.criteriaTitle, { color: tintColor }]}>
          {CRITERIA_LABELS[index]}
        </ThemedText>
      </ThemedView>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.criteriaScrollView}>
        <ThemedView style={styles.criteriaGrid}>
          {criteria.map((item) => {
            const isSelected = selectedItems.includes(item);
            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.criteriaPill,
                  { borderColor: textColor + '30' },
                  isSelected && { backgroundColor: tintColor, borderColor: tintColor }
                ]}
                onPress={() => toggleItem(item)}
                activeOpacity={0.7}
              >
                <ThemedText
                  style={[
                    styles.pillText,
                    isSelected && { color: 'white' }
                  ]}
                >
                  {item}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ThemedView style={styles.content}>
        {/* Swipeable criteria content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.swipeableContainer}
          contentContainerStyle={{ width: screenWidth * criterias.length }}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setCurrentCriteriaIndex(index);
          }}
        >
          {criterias.map((criteria, index) => renderCriteriaPage(criteria, index))}
        </ScrollView>

        {/* Explore button - always visible at bottom */}
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: tintColor }]}
          onPress={handleExplore}
          activeOpacity={0.8}
        >
          <IconSymbol name="play.fill" size={20} color="white" style={styles.buttonIcon} />
          <View style={styles.buttonTextContainer}>
            <ThemedText style={styles.exploreButtonTitle}>
              Explore
            </ThemedText>
            <ThemedText style={styles.exploreButtonSubtitle} numberOfLines={1}>
              {selectedItems.length > 0 ? (() => {
                const maxLength = 40; // Approximate character limit
                const itemsText = selectedItems.join(', ');
                if (itemsText.length <= maxLength) {
                  return itemsText;
                }
                
                let truncatedText = '';
                let itemCount = 0;
                
                for (const item of selectedItems) {
                  const testText = truncatedText ? `${truncatedText}, ${item}` : item;
                  if (testText.length > maxLength - 15) { // Reserve space for "... + X more"
                    break;
                  }
                  truncatedText = testText;
                  itemCount++;
                }
                
                const remainingCount = selectedItems.length - itemCount;
                return remainingCount > 0 
                  ? `${truncatedText}... +${remainingCount} more`
                  : truncatedText;
              })() : 'Any'}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  criteriaHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  criteriaTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  swipeableContainer: {
    flex: 1,
  },
  criteriaPage: {
    flex: 1,
  },
  criteriaScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 20,
  },
  criteriaPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginBottom: 100,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 56, // Fixed height to prevent button growing
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  exploreButtonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  exploreButtonSubtitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.9,
    marginTop: 2,
  },
});