import Falcor from 'falcor';
import FalcorHttpDataSource from 'falcor-http-datasource';

// Look up the namespaced API endpoint for data, will switch over to `/api`
// once there is parity.
var source = new FalcorHttpDataSource('/api/falcor');

// Create a single model for the entire application.
export default window.model = new Falcor.Model({ source });
