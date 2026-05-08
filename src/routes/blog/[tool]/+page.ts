import type { PageLoad } from './$types';
import { CHAIN_CONFIGS } from '$lib/utils/constants';

export const load: PageLoad = async ({ params }) => {
  const tool = params.tool;
  const config = CHAIN_CONFIGS[tool];

  if (!config) {
    return {
      status: 404,
      tool: null,
      config: null,
    };
  }

  return {
    tool,
    config,
  };
};
