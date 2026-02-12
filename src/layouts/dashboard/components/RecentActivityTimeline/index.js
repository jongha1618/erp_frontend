/* eslint-disable react/prop-types */
import TimelineItem from "examples/Timeline/TimelineItem";
import TimelineList from "examples/Timeline/TimelineList";

function RecentActivityTimeline({ activities = [] }) {
  if (activities.length === 0) {
    return <TimelineList title="Recent Activity">No recent activity</TimelineList>;
  }

  return (
    <TimelineList title="Recent Activity">
      {activities.map((item, index) => (
        <TimelineItem
          key={index}
          color={item.color || "info"}
          icon={item.icon || "notifications"}
          title={item.description}
          dateTime={item.timestamp ? new Date(item.timestamp).toLocaleString("ko-KR") : ""}
          lastItem={index === activities.length - 1}
        />
      ))}
    </TimelineList>
  );
}

export default RecentActivityTimeline;
