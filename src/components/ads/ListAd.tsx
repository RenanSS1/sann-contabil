import { AdContainer } from './AdContainer';
import { AdsenseAd } from './AdsenseAd';

export const ListAd = () => (
  <AdContainer width="100%">
    <AdsenseAd 
      slot="LIST_SLOT" 
      responsive={true} 
    />
  </AdContainer>
);
