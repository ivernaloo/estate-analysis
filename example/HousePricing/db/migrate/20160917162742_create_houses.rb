class CreateHouses < ActiveRecord::Migration
  def change
    create_table :houses do |t|

      t.integer :area
      t.string :url
      t.integer :average_price
      t.string :floor
      t.string :build_time
      t.string :community
      t.string :room_shape
      t.float :latitude
      t.float :longitude
      t.string :street

      t.float :distance

      t.timestamps null: false
    end
  end
end
