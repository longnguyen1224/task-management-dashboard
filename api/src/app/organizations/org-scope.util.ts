import { Repository } from 'typeorm';
import { Organization } from './organization.entity';

/**
 * Return all organization IDs a user can access
 * - Parent org: parent + direct children
 * - Child org: only itself
 */
export async function getAccessibleOrgIds(
  userOrgId: string,
  orgRepo: Repository<Organization>,
): Promise<string[]> {
  const org = await orgRepo.findOne({
    where: { id: userOrgId },
    relations: ['children', 'parent'],
  });

  if (!org) return [];

  // If org has children → parent org
  if (org.children && org.children.length > 0) {
    return [org.id, ...org.children.map((c) => c.id)];
  }

  // Otherwise → child org
  return [org.id];
}
