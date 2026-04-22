import { useAgencyScope } from "@/hooks/useAgencyScope";

/**
 * OwnerOnly
 *
 * Hides children when the current viewer is staff (view-only sprint policy).
 * Use this around every write-action surface: buttons that create / edit /
 * delete records, or controls that mutate state on behalf of the agency.
 *
 * Once staff write access lands (RLS + audit trail), individual call sites
 * can be loosened or replaced with finer-grained section gates.
 *
 * See: KNOWN_LIMITATIONS.md → "Staff write access".
 */
interface OwnerOnlyProps {
  children: React.ReactNode;
  /** Optional fallback shown to staff (e.g. an inline tooltip). Default: nothing. */
  fallback?: React.ReactNode;
}

const OwnerOnly = ({ children, fallback = null }: OwnerOnlyProps) => {
  const { isViewingAsStaff, loading } = useAgencyScope();
  if (loading) return null;
  if (isViewingAsStaff) return <>{fallback}</>;
  return <>{children}</>;
};

export default OwnerOnly;
