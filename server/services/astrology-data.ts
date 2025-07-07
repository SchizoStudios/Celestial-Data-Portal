import * as fs from 'fs';
import * as path from 'path';

// Enhanced Astrology Data Service integrating the user's comprehensive astrology vault
export class AstrologyDataService {
  private static basePath = path.join(process.cwd(), 'attached_assets', 'Astrology Arith(m)etic Vault - The Building Blocks of Astrology');

  // Enhanced Zodiac Sign data from the vault
  static getZodiacSignData(sign: string): any {
    try {
      const signPath = path.join(this.basePath, 'Complete Astrology', '02 Signs', 'Sign Descriptions', `${sign}.md`);
      if (fs.existsSync(signPath)) {
        const content = fs.readFileSync(signPath, 'utf-8');
        return this.parseMarkdownContent(content);
      }
    } catch (error) {
      console.warn(`Could not load sign data for ${sign}:`, error);
    }
    
    // Enhanced fallback data with more comprehensive information
    return this.getEnhancedZodiacData(sign);
  }

  // Enhanced Planet data from the vault
  static getPlanetData(planet: string): any {
    try {
      const planetPath = path.join(this.basePath, 'Complete Astrology', '03_Planets');
      const overviewPath = path.join(planetPath, 'Overview_of_Planets.md');
      
      if (fs.existsSync(overviewPath)) {
        const content = fs.readFileSync(overviewPath, 'utf-8');
        const planetData = this.extractPlanetFromOverview(content, planet);
        if (planetData) return planetData;
      }
    } catch (error) {
      console.warn(`Could not load planet data for ${planet}:`, error);
    }

    return this.getEnhancedPlanetData(planet);
  }

  // Enhanced Aspect data from the vault
  static getAspectData(aspectType: string): any {
    try {
      const aspectsPath = path.join(this.basePath, 'Complete Astrology', '05_Aspects');
      // Load from aspects directory when available
      const files = fs.readdirSync(aspectsPath);
      const aspectFile = files.find(f => f.toLowerCase().includes(aspectType.toLowerCase()));
      
      if (aspectFile) {
        const content = fs.readFileSync(path.join(aspectsPath, aspectFile), 'utf-8');
        return this.parseMarkdownContent(content);
      }
    } catch (error) {
      console.warn(`Could not load aspect data for ${aspectType}:`, error);
    }

    return this.getEnhancedAspectData(aspectType);
  }

  // Enhanced House data from the vault
  static getHouseData(house: number): any {
    try {
      const housePath = path.join(this.basePath, 'Complete Astrology', '04_Houses', 'Individual_Houses', `House_${house}.md`);
      if (fs.existsSync(housePath)) {
        const content = fs.readFileSync(housePath, 'utf-8');
        return this.parseMarkdownContent(content);
      }
    } catch (error) {
      console.warn(`Could not load house data for ${house}:`, error);
    }

    return this.getEnhancedHouseData(house);
  }

  // Get fixed star data
  static getFixedStarData(star: string): any {
    try {
      const starsPath = path.join(this.basePath, 'Definitions', 'Fixed Stars');
      const files = fs.readdirSync(starsPath);
      const starFile = files.find(f => f.toLowerCase().includes(star.toLowerCase()));
      
      if (starFile) {
        const content = fs.readFileSync(path.join(starsPath, starFile), 'utf-8');
        return this.parseMarkdownContent(content);
      }
    } catch (error) {
      console.warn(`Could not load fixed star data for ${star}:`, error);
    }

    return null;
  }

  // Get all available templates
  static getTemplates(): string[] {
    try {
      const templatesPath = path.join(this.basePath, 'Templates');
      return fs.readdirSync(templatesPath).filter(f => f.endsWith('.md'));
    } catch (error) {
      console.warn('Could not load templates:', error);
      return [];
    }
  }

  // Get template content
  static getTemplate(templateName: string): string | null {
    try {
      const templatePath = path.join(this.basePath, 'Templates', templateName);
      if (fs.existsSync(templatePath)) {
        return fs.readFileSync(templatePath, 'utf-8');
      }
    } catch (error) {
      console.warn(`Could not load template ${templateName}:`, error);
    }
    return null;
  }

  // Parse markdown content into structured data
  private static parseMarkdownContent(content: string): any {
    const lines = content.split('\n');
    const data: any = {
      title: '',
      description: '',
      keywords: [],
      attributes: {},
      content: content
    };

    let currentSection = '';
    let inCodeBlock = false;

    for (const line of lines) {
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      if (inCodeBlock) continue;

      if (line.startsWith('# ')) {
        data.title = line.replace('# ', '').trim();
      } else if (line.startsWith('## ')) {
        currentSection = line.replace('## ', '').trim();
        data.attributes[currentSection] = '';
      } else if (line.startsWith('- ') && currentSection) {
        if (!data.attributes[currentSection]) {
          data.attributes[currentSection] = [];
        }
        if (Array.isArray(data.attributes[currentSection])) {
          data.attributes[currentSection].push(line.replace('- ', '').trim());
        }
      } else if (line.trim() && currentSection) {
        if (Array.isArray(data.attributes[currentSection])) {
          // Keep as array
        } else {
          data.attributes[currentSection] += line + '\n';
        }
      } else if (line.trim() && !data.description) {
        data.description = line.trim();
      }
    }

    return data;
  }

  // Extract planet data from overview file
  private static extractPlanetFromOverview(content: string, planet: string): any | null {
    const planetSection = content.split('\n').find(line => 
      line.toLowerCase().includes(planet.toLowerCase()) && 
      (line.startsWith('#') || line.startsWith('##'))
    );
    
    if (planetSection) {
      // Extract content between this planet and next planet
      const lines = content.split('\n');
      const startIndex = lines.indexOf(planetSection);
      let endIndex = lines.length;
      
      for (let i = startIndex + 1; i < lines.length; i++) {
        if (lines[i].startsWith('#') && lines[i].toLowerCase().includes('planet')) {
          endIndex = i;
          break;
        }
      }
      
      const planetContent = lines.slice(startIndex, endIndex).join('\n');
      return this.parseMarkdownContent(planetContent);
    }
    
    return null;
  }

  // Enhanced zodiac data with comprehensive attributes
  private static getEnhancedZodiacData(sign: string): any {
    const zodiacData: Record<string, any> = {
      Aries: {
        element: 'Fire',
        modality: 'Cardinal',
        ruler: 'Mars',
        symbol: '♈',
        degrees: '0-30',
        season: 'Spring Equinox',
        keywords: ['Initiative', 'Leadership', 'Courage', 'Independence', 'Energy'],
        strengths: ['Pioneer spirit', 'Courage', 'Direct action', 'Leadership'],
        challenges: ['Impatience', 'Impulsiveness', 'Self-centeredness'],
        bodyParts: ['Head', 'Face', 'Brain'],
        colors: ['Red', 'Orange'],
        stones: ['Diamond', 'Ruby', 'Carnelian'],
        description: 'The first sign of the zodiac, representing new beginnings and pioneering energy.'
      },
      Taurus: {
        element: 'Earth',
        modality: 'Fixed',
        ruler: 'Venus',
        symbol: '♉',
        degrees: '30-60',
        season: 'Late Spring',
        keywords: ['Stability', 'Persistence', 'Sensuality', 'Material Security'],
        strengths: ['Reliability', 'Patience', 'Practical wisdom', 'Loyalty'],
        challenges: ['Stubbornness', 'Materialism', 'Resistance to change'],
        bodyParts: ['Neck', 'Throat', 'Vocal cords'],
        colors: ['Green', 'Pink'],
        stones: ['Emerald', 'Rose Quartz', 'Sapphire']
      },
      Gemini: {
        element: 'Air',
        modality: 'Mutable',
        ruler: 'Mercury',
        symbol: '♊',
        degrees: '60-90',
        season: 'Late Spring',
        keywords: ['Communication', 'Versatility', 'Curiosity', 'Adaptability'],
        strengths: ['Quick wit', 'Adaptability', 'Communication skills', 'Learning ability'],
        challenges: ['Inconsistency', 'Superficiality', 'Nervousness'],
        bodyParts: ['Arms', 'Hands', 'Lungs', 'Nervous system'],
        colors: ['Yellow', 'Silver'],
        stones: ['Agate', 'Citrine', 'Tiger\'s Eye']
      },
      Cancer: {
        element: 'Water',
        modality: 'Cardinal',
        ruler: 'Moon',
        symbol: '♋',
        degrees: '90-120',
        season: 'Summer Solstice',
        keywords: ['Nurturing', 'Intuition', 'Protection', 'Emotion'],
        strengths: ['Emotional intelligence', 'Nurturing ability', 'Intuition', 'Loyalty'],
        challenges: ['Moodiness', 'Over-sensitivity', 'Clinging'],
        bodyParts: ['Chest', 'Breasts', 'Stomach'],
        colors: ['Silver', 'White', 'Blue'],
        stones: ['Moonstone', 'Pearl', 'Cancer']
      },
      Leo: {
        element: 'Fire',
        modality: 'Fixed',
        ruler: 'Sun',
        symbol: '♌',
        degrees: '120-150',
        season: 'Mid Summer',
        keywords: ['Creativity', 'Leadership', 'Drama', 'Confidence'],
        strengths: ['Confidence', 'Generosity', 'Leadership', 'Creativity'],
        challenges: ['Ego', 'Pride', 'Attention-seeking'],
        bodyParts: ['Heart', 'Spine', 'Back'],
        colors: ['Gold', 'Orange', 'Yellow'],
        stones: ['Ruby', 'Peridot', 'Sardonyx']
      },
      Virgo: {
        element: 'Earth',
        modality: 'Mutable',
        ruler: 'Mercury',
        symbol: '♍',
        degrees: '150-180',
        season: 'Late Summer',
        keywords: ['Analysis', 'Service', 'Perfection', 'Health'],
        strengths: ['Analytical mind', 'Attention to detail', 'Service orientation', 'Practical wisdom'],
        challenges: ['Perfectionism', 'Criticism', 'Worry'],
        bodyParts: ['Digestive system', 'Intestines'],
        colors: ['Navy blue', 'Brown', 'Green'],
        stones: ['Sapphire', 'Carnelian', 'Peridot']
      },
      Libra: {
        element: 'Air',
        modality: 'Cardinal',
        ruler: 'Venus',
        symbol: '♎',
        degrees: '180-210',
        season: 'Autumn Equinox',
        keywords: ['Balance', 'Harmony', 'Justice', 'Relationships'],
        strengths: ['Diplomacy', 'Aesthetic sense', 'Cooperation', 'Justice'],
        challenges: ['Indecision', 'People-pleasing', 'Superficiality'],
        bodyParts: ['Kidneys', 'Lower back', 'Skin'],
        colors: ['Pink', 'Blue', 'Green'],
        stones: ['Opal', 'Tourmaline', 'Jade']
      },
      Scorpio: {
        element: 'Water',
        modality: 'Fixed',
        ruler: 'Pluto',
        coRuler: 'Mars',
        symbol: '♏',
        degrees: '210-240',
        season: 'Mid Autumn',
        keywords: ['Transformation', 'Intensity', 'Mystery', 'Power'],
        strengths: ['Depth', 'Transformation ability', 'Intuition', 'Determination'],
        challenges: ['Jealousy', 'Secretiveness', 'Vengefulness'],
        bodyParts: ['Reproductive organs', 'Pelvis'],
        colors: ['Deep red', 'Black', 'Maroon'],
        stones: ['Topaz', 'Malachite', 'Garnet']
      },
      Sagittarius: {
        element: 'Fire',
        modality: 'Mutable',
        ruler: 'Jupiter',
        symbol: '♐',
        degrees: '240-270',
        season: 'Late Autumn',
        keywords: ['Adventure', 'Philosophy', 'Freedom', 'Wisdom'],
        strengths: ['Optimism', 'Adventure spirit', 'Philosophy', 'Freedom'],
        challenges: ['Restlessness', 'Tactlessness', 'Overconfidence'],
        bodyParts: ['Hips', 'Thighs', 'Liver'],
        colors: ['Purple', 'Turquoise'],
        stones: ['Turquoise', 'Tanzanite', 'Blue Topaz']
      },
      Capricorn: {
        element: 'Earth',
        modality: 'Cardinal',
        ruler: 'Saturn',
        symbol: '♑',
        degrees: '270-300',
        season: 'Winter Solstice',
        keywords: ['Ambition', 'Discipline', 'Structure', 'Achievement'],
        strengths: ['Discipline', 'Responsibility', 'Ambition', 'Practical wisdom'],
        challenges: ['Pessimism', 'Rigidity', 'Workaholism'],
        bodyParts: ['Knees', 'Bones', 'Skin'],
        colors: ['Brown', 'Black', 'Dark green'],
        stones: ['Garnet', 'Onyx', 'Jet']
      },
      Aquarius: {
        element: 'Air',
        modality: 'Fixed',
        ruler: 'Uranus',
        coRuler: 'Saturn',
        symbol: '♒',
        degrees: '300-330',
        season: 'Mid Winter',
        keywords: ['Innovation', 'Humanitarianism', 'Independence', 'Progress'],
        strengths: ['Innovation', 'Humanitarianism', 'Independence', 'Vision'],
        challenges: ['Detachment', 'Rebelliousness', 'Unpredictability'],
        bodyParts: ['Ankles', 'Circulatory system'],
        colors: ['Electric blue', 'Silver'],
        stones: ['Amethyst', 'Garnet', 'Jasper']
      },
      Pisces: {
        element: 'Water',
        modality: 'Mutable',
        ruler: 'Neptune',
        coRuler: 'Jupiter',
        symbol: '♓',
        degrees: '330-360',
        season: 'Late Winter',
        keywords: ['Compassion', 'Intuition', 'Spirituality', 'Dreams'],
        strengths: ['Compassion', 'Artistic ability', 'Intuition', 'Spirituality'],
        challenges: ['Escapism', 'Confusion', 'Victim mentality'],
        bodyParts: ['Feet', 'Lymphatic system'],
        colors: ['Sea green', 'Purple'],
        stones: ['Aquamarine', 'Bloodstone', 'Jasper']
      }
    };

    return zodiacData[sign] || { name: sign, description: 'Sign data not available' };
  }

  // Enhanced planet data
  private static getEnhancedPlanetData(planet: string): any {
    const planetData: Record<string, any> = {
      Sun: {
        symbol: '☉',
        element: 'Fire',
        rules: 'Leo',
        keywords: ['Identity', 'Ego', 'Vitality', 'Leadership', 'Authority'],
        meaning: 'Core self, vital essence, life purpose',
        bodyParts: ['Heart', 'Spine', 'Back'],
        associations: ['Gold', 'Orange', 'Sunday', 'Lions', 'Kings']
      },
      Moon: {
        symbol: '☽',
        element: 'Water',
        rules: 'Cancer',
        keywords: ['Emotions', 'Intuition', 'Memory', 'Nurturing', 'Cycles'],
        meaning: 'Emotional nature, subconscious patterns, instincts',
        bodyParts: ['Stomach', 'Breasts', 'Fluids'],
        associations: ['Silver', 'White', 'Monday', 'Crabs', 'Mothers']
      },
      Mercury: {
        symbol: '☿',
        element: 'Air',
        rules: ['Gemini', 'Virgo'],
        keywords: ['Communication', 'Learning', 'Analysis', 'Movement', 'Intelligence'],
        meaning: 'Mind, communication, reasoning, learning processes',
        bodyParts: ['Nervous system', 'Hands', 'Lungs'],
        associations: ['Yellow', 'Wednesday', 'Messengers', 'Students']
      },
      Venus: {
        symbol: '♀',
        element: 'Earth/Air',
        rules: ['Taurus', 'Libra'],
        keywords: ['Love', 'Beauty', 'Values', 'Harmony', 'Attraction'],
        meaning: 'Love nature, aesthetic sense, values, relationships',
        bodyParts: ['Throat', 'Kidneys', 'Skin'],
        associations: ['Green', 'Pink', 'Friday', 'Artists', 'Lovers']
      },
      Mars: {
        symbol: '♂',
        element: 'Fire',
        rules: 'Aries',
        coRules: 'Scorpio',
        keywords: ['Action', 'Energy', 'Desire', 'Courage', 'Conflict'],
        meaning: 'Drive, passion, assertion, physical energy',
        bodyParts: ['Muscles', 'Head', 'Genitals'],
        associations: ['Red', 'Tuesday', 'Warriors', 'Athletes']
      },
      Jupiter: {
        symbol: '♃',
        element: 'Fire',
        rules: 'Sagittarius',
        coRules: 'Pisces',
        keywords: ['Expansion', 'Wisdom', 'Philosophy', 'Luck', 'Growth'],
        meaning: 'Growth, expansion, higher learning, fortune',
        bodyParts: ['Liver', 'Hips', 'Thighs'],
        associations: ['Purple', 'Thursday', 'Teachers', 'Philosophers']
      },
      Saturn: {
        symbol: '♄',
        element: 'Earth',
        rules: 'Capricorn',
        coRules: 'Aquarius',
        keywords: ['Structure', 'Discipline', 'Limitation', 'Authority', 'Time'],
        meaning: 'Discipline, responsibility, limitations, lessons',
        bodyParts: ['Bones', 'Skin', 'Knees'],
        associations: ['Brown', 'Black', 'Saturday', 'Elders', 'Authorities']
      },
      Uranus: {
        symbol: '♅',
        element: 'Air',
        rules: 'Aquarius',
        keywords: ['Revolution', 'Innovation', 'Freedom', 'Change', 'Rebellion'],
        meaning: 'Innovation, revolution, sudden change, independence',
        bodyParts: ['Nervous system', 'Ankles'],
        associations: ['Electric blue', 'Technology', 'Rebels', 'Inventors']
      },
      Neptune: {
        symbol: '♆',
        element: 'Water',
        rules: 'Pisces',
        keywords: ['Spirituality', 'Dreams', 'Illusion', 'Compassion', 'Transcendence'],
        meaning: 'Spirituality, dreams, illusions, compassion',
        bodyParts: ['Feet', 'Lymphatic system'],
        associations: ['Sea green', 'Mystics', 'Artists', 'Healers']
      },
      Pluto: {
        symbol: '♇',
        element: 'Water',
        rules: 'Scorpio',
        keywords: ['Transformation', 'Power', 'Regeneration', 'Death/Rebirth', 'Hidden'],
        meaning: 'Transformation, hidden power, regeneration, depth',
        bodyParts: ['Reproductive system', 'Colon'],
        associations: ['Deep red', 'Black', 'Transformers', 'Healers']
      }
    };

    return planetData[planet] || { name: planet, description: 'Planet data not available' };
  }

  // Enhanced aspect data
  private static getEnhancedAspectData(aspectType: string): any {
    const aspectData: Record<string, any> = {
      Conjunction: {
        symbol: '☌',
        angle: 0,
        orb: 8,
        nature: 'Neutral/Intensive',
        keywords: ['Union', 'Fusion', 'Intensity', 'New beginnings'],
        meaning: 'Energies blend and intensify each other',
        interpretation: 'A powerful blending of planetary energies'
      },
      Opposition: {
        symbol: '☍',
        angle: 180,
        orb: 8,
        nature: 'Dynamic/Challenging',
        keywords: ['Polarity', 'Tension', 'Awareness', 'Balance'],
        meaning: 'Opposing forces seeking balance and integration',
        interpretation: 'Tension that leads to greater awareness'
      },
      Trine: {
        symbol: '△',
        angle: 120,
        orb: 8,
        nature: 'Harmonious/Flowing',
        keywords: ['Harmony', 'Ease', 'Talent', 'Flow'],
        meaning: 'Natural harmony and easy expression of energies',
        interpretation: 'Natural talents and easy flowing energy'
      },
      Square: {
        symbol: '□',
        angle: 90,
        orb: 8,
        nature: 'Dynamic/Challenging',
        keywords: ['Challenge', 'Tension', 'Action', 'Growth'],
        meaning: 'Dynamic tension that motivates action and growth',
        interpretation: 'Challenges that drive personal growth'
      },
      Sextile: {
        symbol: '⚹',
        angle: 60,
        orb: 6,
        nature: 'Harmonious/Opportunity',
        keywords: ['Opportunity', 'Cooperation', 'Skills', 'Potential'],
        meaning: 'Supportive energy that creates opportunities',
        interpretation: 'Opportunities for growth and cooperation'
      },
      Quincunx: {
        symbol: '⚻',
        angle: 150,
        orb: 3,
        nature: 'Adjustment/Awkward',
        keywords: ['Adjustment', 'Adaptation', 'Awkwardness', 'Refinement'],
        meaning: 'Requires constant adjustment and adaptation',
        interpretation: 'Awkward energy requiring constant adjustment'
      }
    };

    return aspectData[aspectType] || { name: aspectType, description: 'Aspect data not available' };
  }

  // Enhanced house data
  private static getEnhancedHouseData(house: number): any {
    const houseData: Record<number, any> = {
      1: {
        name: 'First House',
        keywords: ['Identity', 'Appearance', 'First Impressions', 'Self'],
        element: 'Fire',
        naturalSign: 'Aries',
        naturalRuler: 'Mars',
        meaning: 'House of Self and Identity',
        bodyParts: ['Head', 'Face'],
        themes: ['Personal identity', 'Physical appearance', 'First impressions', 'New beginnings']
      },
      2: {
        name: 'Second House',
        keywords: ['Values', 'Money', 'Possessions', 'Resources'],
        element: 'Earth',
        naturalSign: 'Taurus',
        naturalRuler: 'Venus',
        meaning: 'House of Values and Resources',
        bodyParts: ['Neck', 'Throat'],
        themes: ['Personal values', 'Material resources', 'Self-worth', 'Money management']
      },
      3: {
        name: 'Third House',
        keywords: ['Communication', 'Learning', 'Siblings', 'Short Travel'],
        element: 'Air',
        naturalSign: 'Gemini',
        naturalRuler: 'Mercury',
        meaning: 'House of Communication and Learning',
        bodyParts: ['Arms', 'Hands', 'Lungs'],
        themes: ['Communication skills', 'Learning style', 'Siblings', 'Local environment']
      },
      4: {
        name: 'Fourth House',
        keywords: ['Home', 'Family', 'Roots', 'Foundation'],
        element: 'Water',
        naturalSign: 'Cancer',
        naturalRuler: 'Moon',
        meaning: 'House of Home and Family',
        bodyParts: ['Chest', 'Stomach'],
        themes: ['Family background', 'Home environment', 'Emotional foundation', 'Ancestry']
      },
      5: {
        name: 'Fifth House',
        keywords: ['Creativity', 'Romance', 'Children', 'Fun'],
        element: 'Fire',
        naturalSign: 'Leo',
        naturalRuler: 'Sun',
        meaning: 'House of Creativity and Romance',
        bodyParts: ['Heart', 'Back'],
        themes: ['Creative expression', 'Romance', 'Children', 'Entertainment']
      },
      6: {
        name: 'Sixth House',
        keywords: ['Health', 'Work', 'Service', 'Daily Routine'],
        element: 'Earth',
        naturalSign: 'Virgo',
        naturalRuler: 'Mercury',
        meaning: 'House of Health and Service',
        bodyParts: ['Digestive system'],
        themes: ['Daily work', 'Health habits', 'Service to others', 'Pets']
      },
      7: {
        name: 'Seventh House',
        keywords: ['Partnerships', 'Marriage', 'Open Enemies', 'Cooperation'],
        element: 'Air',
        naturalSign: 'Libra',
        naturalRuler: 'Venus',
        meaning: 'House of Partnerships',
        bodyParts: ['Kidneys', 'Lower back'],
        themes: ['Marriage', 'Business partnerships', 'Open conflicts', 'Cooperation']
      },
      8: {
        name: 'Eighth House',
        keywords: ['Transformation', 'Shared Resources', 'Death/Rebirth', 'Mystery'],
        element: 'Water',
        naturalSign: 'Scorpio',
        naturalRuler: 'Pluto',
        meaning: 'House of Transformation',
        bodyParts: ['Reproductive organs'],
        themes: ['Shared finances', 'Transformation', 'Occult interests', 'Legacy']
      },
      9: {
        name: 'Ninth House',
        keywords: ['Philosophy', 'Higher Education', 'Long Travel', 'Beliefs'],
        element: 'Fire',
        naturalSign: 'Sagittarius',
        naturalRuler: 'Jupiter',
        meaning: 'House of Philosophy and Higher Learning',
        bodyParts: ['Hips', 'Thighs'],
        themes: ['Higher education', 'Philosophy', 'Foreign travel', 'Publishing']
      },
      10: {
        name: 'Tenth House',
        keywords: ['Career', 'Reputation', 'Authority', 'Public Image'],
        element: 'Earth',
        naturalSign: 'Capricorn',
        naturalRuler: 'Saturn',
        meaning: 'House of Career and Reputation',
        bodyParts: ['Knees', 'Bones'],
        themes: ['Career', 'Public reputation', 'Authority figures', 'Life goals']
      },
      11: {
        name: 'Eleventh House',
        keywords: ['Friends', 'Groups', 'Hopes', 'Wishes'],
        element: 'Air',
        naturalSign: 'Aquarius',
        naturalRuler: 'Uranus',
        meaning: 'House of Friends and Hopes',
        bodyParts: ['Ankles', 'Calves'],
        themes: ['Friendships', 'Group associations', 'Hopes and wishes', 'Social causes']
      },
      12: {
        name: 'Twelfth House',
        keywords: ['Spirituality', 'Hidden', 'Subconscious', 'Sacrifice'],
        element: 'Water',
        naturalSign: 'Pisces',
        naturalRuler: 'Neptune',
        meaning: 'House of Spirituality and Hidden Things',
        bodyParts: ['Feet', 'Lymphatic system'],
        themes: ['Spirituality', 'Hidden enemies', 'Subconscious patterns', 'Sacrifice']
      }
    };

    return houseData[house] || { name: `House ${house}`, description: 'House data not available' };
  }
}