-- Add id column to master_hierarchy_raw table if it doesn't exist
ALTER TABLE master_hierarchy_raw 
ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST;
