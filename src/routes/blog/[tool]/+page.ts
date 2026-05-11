import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { CHAIN_CONFIGS } from '$lib/utils/constants';

export const load: PageLoad = async ({ params }) => {
  const tool = params.tool;
  const config = CHAIN_CONFIGS[tool];

  if (!config) {
    throw error(404, {
      message: `Blog article for "${tool}" not found`,
    });
  }

  return {
    tool,
    config,
  };
};
