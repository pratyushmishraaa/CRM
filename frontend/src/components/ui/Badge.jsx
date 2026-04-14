export default function Badge({ label, colorClass = 'bg-gray-100 text-gray-700' }) {
  return <span className={`badge ${colorClass}`}>{label}</span>;
}
