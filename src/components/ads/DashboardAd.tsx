import { AdContainer } from './AdContainer';
import { AdsenseAd } from './AdsenseAd';

export const DashboardAd = () => (
  <AdContainer width="100%">
    <AdsenseAd 
      slot="DASHBOARD_SLOT" 
      responsive={true} 
    />
  </AdContainer>
);
