import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const STATUS_COLORS = {
  draft: "default",
  blocked: "warning",
  ready: "info",
  in_progress: "primary",
  completed: "success",
  cancelled: "error",
};

function WorkOrderTreeView({ rootWoId, onRefresh }) {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!rootWoId) return;

    setLoading(true);
    axios
      .get(`http://localhost:5000/work-orders/tree/${rootWoId}`)
      .then((response) => {
        setTreeData(response.data);
        // Auto-expand all nodes
        const getAllIds = (node) => {
          let ids = [node.wo_id.toString()];
          if (node.children) {
            node.children.forEach((child) => {
              ids = ids.concat(getAllIds(child));
            });
          }
          return ids;
        };
        setExpanded(getAllIds(response.data));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching work order tree:", error);
        setLoading(false);
      });
  }, [rootWoId, onRefresh]);

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const renderTreeLabel = (node) => {
    const progress = node.progress_percent || 0;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 0.5,
          pr: 0,
          gap: 1,
        }}
      >
        <MDTypography variant="button" fontWeight="medium" sx={{ minWidth: 120 }}>
          {node.wo_number}
        </MDTypography>

        <Chip
          label={node.status.replace("_", " ")}
          color={STATUS_COLORS[node.status]}
          size="small"
          sx={{ minWidth: 80 }}
        />

        <Box sx={{ display: "flex", alignItems: "center", minWidth: 150 }}>
          <MDTypography variant="caption" color="text" sx={{ mr: 1 }}>
            {node.output_item_code}
          </MDTypography>
          <MDTypography variant="caption" color="secondary">
            ({node.quantity_completed || 0}/{node.quantity_ordered})
          </MDTypography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", width: 120 }}>
          <Box sx={{ width: "100%", mr: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={progress >= 100 ? "success" : "primary"}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <MDTypography variant="caption" sx={{ minWidth: 35 }}>
            {progress}%
          </MDTypography>
        </Box>

        <IconButton
          size="small"
          color="info"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/workorders/newworkorder/${node.wo_id}`);
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const renderTree = (node) => (
    <TreeItem
      key={node.wo_id}
      nodeId={node.wo_id.toString()}
      label={renderTreeLabel(node)}
      sx={{
        "& .MuiTreeItem-content": {
          py: 0.5,
          borderRadius: 1,
          "&:hover": {
            backgroundColor: "action.hover",
          },
        },
        "& .MuiTreeItem-group": {
          ml: 2,
          borderLeft: "1px dashed",
          borderColor: "divider",
        },
      }}
    >
      {node.children?.map((child) => renderTree(child))}
    </TreeItem>
  );

  if (loading) {
    return (
      <MDBox p={3} textAlign="center">
        <MDTypography variant="caption">Loading tree...</MDTypography>
      </MDBox>
    );
  }

  if (!treeData) {
    return (
      <MDBox p={3} textAlign="center">
        <MDTypography variant="caption" color="error">
          Failed to load work order tree
        </MDTypography>
      </MDBox>
    );
  }

  return (
    <MDBox p={2}>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        onNodeToggle={handleToggle}
        sx={{
          flexGrow: 1,
          "& .MuiTreeItem-root": {
            "& .MuiTreeItem-content": {
              padding: "4px 8px",
            },
          },
        }}
      >
        {renderTree(treeData)}
      </TreeView>
    </MDBox>
  );
}

WorkOrderTreeView.propTypes = {
  rootWoId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onRefresh: PropTypes.number,
};

export default WorkOrderTreeView;
