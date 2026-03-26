const StatusBadge = ({ status }) => {
  const styles = {
    CREATED: 'badge-primary',
    ACCEPTED: 'badge-accent',
    REJECTED: 'badge-danger',
    CANCELLED: 'badge-warning',
    COMPLETED: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    active: 'badge-accent',
    blocked: 'badge-danger',
  };

  return (
    <span className={`badge ${styles[status] || 'badge-primary'}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
