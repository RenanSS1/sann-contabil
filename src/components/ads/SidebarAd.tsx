import { AdContainer } from './AdContainer';
import { AdsenseAd } from './AdsenseAd';

export const SidebarAd = () => (
  <AdContainer width="300px" height="600px">
    <AdsenseAd 
      slot="SIDEBAR_SLOT" 
      responsive={false} 
    />
  </AdContainer>
);
